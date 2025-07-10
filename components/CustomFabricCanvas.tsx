"use client"
import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from "react"
import { fabric } from "fabric"
import { getSnapPointsForCurrentToy } from "@/lib/snapPoints"

export interface Category {
  _id: string
  name: string
  parent: string | null
  type: string
  image?: string
  price?: number
}

const CustomFabricCanvas = forwardRef(function CustomFabricCanvas({ selectedOptions, categories, canvasJSON, backgroundImage, customTexts = [], onCustomTextsChange }: { 
  selectedOptions: any, 
  categories: Category[], 
  canvasJSON?: any,
  backgroundImage?: string,
  customTexts?: { id: string, text: string, fill: string, fontSize: number, fontFamily: string, left: number, top: number }[],
  onCustomTextsChange?: (texts: any[]) => void
}, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<any>(null)
  // Lưu trạng thái từng part (vị trí, scale, góc xoay...)
  const partStatesRef = useRef<{ [id: string]: any }>({})
  const [hasLoadedFromJSON, setHasLoadedFromJSON] = useState(false)
  const [justRestored, setJustRestored] = useState(false)

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    toJSON: () => fabricCanvasRef.current?.toJSON() || {},
    getCanvas: () => fabricCanvasRef.current,
    toDataURL: (options?: any) => fabricCanvasRef.current?.toDataURL(options),
    getActiveObject: () => fabricCanvasRef.current?.getActiveObject(),
    remove: (object: any) => fabricCanvasRef.current?.remove(object),
    discardActiveObject: () => fabricCanvasRef.current?.discardActiveObject(),
    renderAll: () => fabricCanvasRef.current?.renderAll(),
    updateFurColor: (color: string) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      const bodyObject = canvas.getObjects().find((obj: any) => obj.partType === 'body');
      if (bodyObject) {
        // Remove previous color filters
        bodyObject.filters = bodyObject.filters?.filter((f: any) => f.type !== 'BlendColor');
        // Add new color filter
        if (color) {
          bodyObject.filters?.push(new fabric.Image.filters.BlendColor({
            color: color,
            mode: 'tint',
            alpha: 0.7 // Độ đậm nhạt của màu, có thể điều chỉnh
          }));
        }
        bodyObject.applyFilters();
        canvas.renderAll();
      }
    },
    // Thêm text mới
    addText: (text: string, options?: { left?: number, top?: number, fill?: string, fontSize?: number, fontFamily?: string }) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      const textbox = new fabric.Textbox(text, {
        left: options?.left ?? canvas.width / 2,
        top: options?.top ?? canvas.height / 2,
        fill: options?.fill ?? '#000',
        fontSize: options?.fontSize ?? 32,
        fontFamily: options?.fontFamily ?? 'Arial',
        editable: true,
        fontWeight: 'bold',
        borderColor: '#f472b6',
        cornerColor: '#f472b6',
        cornerSize: 8,
        transparentCorners: false,
        padding: 4,
        lockUniScaling: false,
      });
      canvas.add(textbox);
      canvas.setActiveObject(textbox);
      canvas.renderAll();
    },
    // Chỉnh sửa text đang chọn
    updateActiveText: (props: { text?: string, fill?: string, fontSize?: number, fontFamily?: string }) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      const active = canvas.getActiveObject();
      if (active && active.type === 'textbox') {
        if (props.text !== undefined) (active as any).text = props.text;
        if (props.fill !== undefined) (active as any).set('fill', props.fill);
        if (props.fontSize !== undefined) (active as any).set('fontSize', props.fontSize);
        if (props.fontFamily !== undefined) (active as any).set('fontFamily', props.fontFamily);
        canvas.renderAll();
      }
    },
    // Xoá text đang chọn
    deleteActiveText: () => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      const active = canvas.getActiveObject();
      if (active && active.type === 'textbox') {
        canvas.remove(active);
        canvas.discardActiveObject();
        canvas.renderAll();
      }
    },
  }), [])

  // Reset hasLoadedFromJSON về false mỗi khi canvasJSON đổi
  useEffect(() => {
    setHasLoadedFromJSON(false);
    setJustRestored(false);
  }, [canvasJSON]);

  // Load canvas từ canvasJSON khi chỉnh sửa (chỉ 1 lần, chỉ khi canvas đã sẵn sàng)
  useEffect(() => {
    if (canvasJSON && fabricCanvasRef.current && !hasLoadedFromJSON) {
      let data = canvasJSON
      if (typeof data === "string") {
        try { data = JSON.parse(data) } catch {}
      }
      if (data && data.objects && Array.isArray(data.objects)) {
        fabricCanvasRef.current.loadFromJSON(data, () => {
          // Đảm bảo body luôn cố định sau khi load JSON
          const objs = fabricCanvasRef.current.getObjects();
          let bodyFound = false;
          objs.forEach((obj: any, idx: number) => {
            // Nếu partType là 'body', hoặc nếu không có partType thì assume object đầu tiên là body
            if (obj.partType === 'body' || (!obj.partType && idx === 0)) {
              obj.set({
                partType: 'body', // Đảm bảo luôn có partType
                selectable: false,
                evented: false,
                lockMovementX: true,
                lockMovementY: true,
                lockScalingX: true,
                lockScalingY: true,
                lockRotation: true
              });
              fabricCanvasRef.current.sendToBack(obj);
              bodyFound = true;
            }
            // Lưu trạng thái vị trí/scale/angle cho các part khác (nếu có partId)
            if (obj.partId && obj.partType) {
              const state = {
                left: obj.left,
                top: obj.top,
                scaleX: obj.scaleX,
                scaleY: obj.scaleY,
                angle: obj.angle,
              };
              partStatesRef.current[obj.partId] = state;
              partStatesRef.current[obj.partType] = state;
              if (!partStatesRef.current[`${obj.partType}_initial`]) {
                partStatesRef.current[`${obj.partType}_initial`] = state;
              }
            }
          });
          // Nếu không tìm thấy body, thử lock object đầu tiên (fallback)
          if (!bodyFound && objs.length > 0) {
            const obj = objs[0];
            obj.set({
              partType: 'body',
              selectable: false,
              evented: false,
              lockMovementX: true,
              lockMovementY: true,
              lockScalingX: true,
              lockScalingY: true,
              lockRotation: true
            });
            fabricCanvasRef.current.sendToBack(obj);
          }
          fabricCanvasRef.current.renderAll()
          setHasLoadedFromJSON(true)
          setJustRestored(true)
        })
      }
    }
  }, [canvasJSON, hasLoadedFromJSON, fabricCanvasRef.current])

  // Khởi tạo Fabric Canvas 1 lần
  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
        width: 500,
        height: 650,
        backgroundColor: "#fdf2f8"
      })
    }
    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose()
        fabricCanvasRef.current = null
      }
    }
  }, [])

  // Lắng nghe sự kiện để lưu trạng thái part
  useEffect(() => {
    const fabricCanvas = fabricCanvasRef.current;
    if (!fabricCanvas) return;
    const saveState = (e: any) => {
      const obj = e.target;
      if (obj && obj.partId && obj.partType) {
        const state = {
          left: obj.left,
          top: obj.top,
          scaleX: obj.scaleX,
          scaleY: obj.scaleY,
          angle: obj.angle,
        };
        partStatesRef.current[obj.partId] = state;
        partStatesRef.current[obj.partType] = state; // Lưu theo loại part
      }
    };
    fabricCanvas.on('object:modified', saveState);
    fabricCanvas.on('object:moving', saveState);
    fabricCanvas.on('object:scaling', saveState);
    fabricCanvas.on('object:rotating', saveState);
    
    // Thêm event listeners cho drag
    const handleDragStart = (e: any) => {
      if (e.target && e.target.partType !== 'body') {
        // No action needed as onDragStart is removed
      }
    };
    
    const handleDragEnd = () => {
      // No action needed as onDragEnd is removed
    };
    
    fabricCanvas.on('mouse:down', handleDragStart);
    fabricCanvas.on('mouse:up', handleDragEnd);
    
    return () => {
      fabricCanvas.off('object:modified', saveState);
      fabricCanvas.off('object:moving', saveState);
      fabricCanvas.off('object:scaling', saveState);
      fabricCanvas.off('object:rotating', saveState);
      fabricCanvas.off('mouse:down', handleDragStart);
      fabricCanvas.off('mouse:up', handleDragEnd);
    };
  }, []);

  // Helper lấy url ảnh từ id
  const getImageUrl = (id: string) => {
    const category = categories.find(c => c._id === id)
    if (!category?.image) return null
    
    // Nếu là URL bên ngoài, chuyển thành URL của server
    if (category.image.startsWith('http')) {
      // Tạo một URL proxy thông qua server của chúng ta
      return `/api/proxy-image?url=${encodeURIComponent(category.image)}`
    }
    return category.image
  }

  const getTypeById = (id: string) => categories.find(c => c._id === id)?.type

  // Vẽ plush toy mỗi khi selectedOptions/cateogries thay đổi (chỉ khi không có canvasJSON)
  useEffect(() => {
    if (canvasJSON) return;
    const fabricCanvas = fabricCanvasRef.current
    if (!fabricCanvas) return

    console.log('[CustomFabricCanvas] selectedOptions:', selectedOptions);

    fabricCanvas.clear()
    if (backgroundImage) {
      fabric.Image.fromURL(backgroundImage, (img: any) => {
        img.set({
          left: 0,
          top: 0,
          scaleX: fabricCanvas.width / img.width!,
          scaleY: fabricCanvas.height / img.height!,
          selectable: false,
          evented: false
        });
        fabricCanvas.setBackgroundImage(img, () => {
          fabricCanvas.renderAll();
        });
      }, { crossOrigin: 'anonymous' });
    } else {
      fabricCanvas.setBackgroundColor("#fdf2f8", fabricCanvas.renderAll.bind(fabricCanvas))
      fabricCanvas.setBackgroundImage(null, fabricCanvas.renderAll.bind(fabricCanvas));
    }

    // Chỉ vẽ khi có ít nhất một phần tử được chọn
    const hasAnySelection = selectedOptions.body || selectedOptions.ears || selectedOptions.eyes || 
                           selectedOptions.nose || selectedOptions.mouth || selectedOptions.furColor || 
                           selectedOptions.clothing || (selectedOptions.accessories && selectedOptions.accessories.length > 0);
    
    console.log("Has any selection:", hasAnySelection);
    
    if (!hasAnySelection) {
      console.log("No selection, keeping canvas empty");
      fabricCanvas.renderAll();
      return;
    }

    // Lấy snap points cho plush toy hiện tại
    const snapPoints = getSnapPointsForCurrentToy(selectedOptions.body)

    // Helper: add part với snap point nếu có
    const addPart = (id: string, type: 'body' | 'ears' | 'eyes' | 'clothing' | 'nose' | 'mouth' | 'accessory' | 'furColor', side?: string, accessoryIndex?: number) => {
      const url = getImageUrl(id)
      console.log('Add part', { id, type, url }); // debug
      if (!url) return
      let snap
      if (type === 'accessory') {
        const accessorySnaps = snapPoints.filter(p => p.type === 'accessory')
        snap = accessorySnaps[accessoryIndex ?? 0] || { x: 0, y: 0, type }
      } else {
        snap = snapPoints.find(p => p.type === type && (!side || p.side === side)) || { x: 0, y: 0, type }
      }

      // Tạo một Image object với crossOrigin
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        const fabricImage = new fabric.Image(img)
        if (type === 'body') {
          // Scale body cho vừa canvas
          const scaleX = 500 / img.width
          const scaleY = 650 / img.height
          fabricImage.set({
            left: 0,
            top: 0,
            scaleX,
            scaleY,
            selectable: false,
            evented: false,
            partType: 'body',
            lockMovementX: true,
            lockMovementY: true,
            lockScalingX: true,
            lockScalingY: true,
            lockRotation: true
          })
          
          // Áp dụng màu lông nếu có
          if (selectedOptions.furColor) {
            // Lấy object màu lông từ categories
            const colorCat = categories.find(cat => cat._id === selectedOptions.furColor);
            const colorHex = colorCat?.image;
            if (colorHex && /^#([0-9A-F]{3}){1,2}$/i.test(colorHex)) {
              fabricImage.filters = fabricImage.filters || [];
              fabricImage.filters.push(new fabric.Image.filters.BlendColor({
                color: colorHex,
                mode: 'tint',
                alpha: 0.7
              }));
              fabricImage.applyFilters();
            }
          }

          fabricCanvas.add(fabricImage)
          fabricCanvas.sendToBack(fabricImage)
        } else {
          fabricImage.set({
            left: snap.x,
            top: snap.y,
            scaleX: 1,
            scaleY: 1,
            selectable: true,
            evented: true,
            partType: type,
            partSide: side || null,
            partId: id,
          })
          // Nếu đã có trạng thái cũ thì apply lại
          let state = partStatesRef.current[id];
          if (!state && partStatesRef.current[`${type}_initial`]) {
            // Nếu chưa có state cho id mới, ưu tiên lấy vị trí gốc từ JSON
            state = { ...partStatesRef.current[`${type}_initial`] };
            partStatesRef.current[id] = state;
          } else if (!state && partStatesRef.current[type]) {
            // Nếu không có vị trí gốc, lấy vị trí cuối cùng của partType
            state = { ...partStatesRef.current[type] };
            partStatesRef.current[id] = state;
          }
          if (state) {
            fabricImage.set({ ...state });
            // Đảm bảo luôn lưu lại state cho id mới (kể cả khi chỉ đổi option)
            partStatesRef.current[id] = { ...state };
          }
          fabricCanvas.add(fabricImage)
          fabricCanvas.bringToFront(fabricImage)
          fabricCanvas.setActiveObject(fabricImage)
          // Clear active object để tránh border xanh và tránh fabric tự động reset vị trí
          fabricCanvas.discardActiveObject();
        }
        fabricCanvas.renderAll()
      }
      img.onerror = (err) => {
        console.error('Error loading image:', err)
      }
      img.src = url
    }

    // 1. Body (body không kéo thả, luôn ở dưới cùng)
    if (selectedOptions.body) {
      addPart(selectedOptions.body, 'body')
    }
    // 2. Ears (giả sử có left/right)
    if (selectedOptions.ears) {
      addPart(selectedOptions.ears, 'ears')
    }
    // 3. Eyes (giả sử có left/right)
    if (selectedOptions.eyes) {
      addPart(selectedOptions.eyes, 'eyes')
    }
    // 4. Nose
    if (selectedOptions.nose) {
      addPart(selectedOptions.nose, 'nose')
    }
    // 5. Mouth
    if (selectedOptions.mouth) {
      addPart(selectedOptions.mouth, 'mouth')
    }
    // 6. Fur Color sẽ được xử lý bằng filter, không phải layer riêng
    // if (selectedOptions.furColor) {
    //   addPart(selectedOptions.furColor, 'furColor')
    // }
    // 7. Clothing
    if (selectedOptions.clothing) {
      addPart(selectedOptions.clothing, 'clothing')
    }
    // 8. Accessories (mảng)
    if (selectedOptions.accessories && selectedOptions.accessories.length > 0) {
      selectedOptions.accessories.forEach((accId: string, idx: number) => {
        addPart(accId, 'accessory', undefined, idx)
      })
    }

    // Snap-to-position khi kéo part
    const onMoving = (e: any) => {
      const obj = e.target
      if (!obj || !obj.partType) return
      const threshold = 30
      // Tìm snap point phù hợp
      let snap
      if (obj.partType === 'accessory') {
        const accessorySnaps = snapPoints.filter(p => p.type === 'accessory')
        snap = accessorySnaps[obj.partId ? selectedOptions.accessories.indexOf(obj.partId) : 0] || { x: 0, y: 0, type: 'accessory' }
      } else {
        snap = snapPoints.find(p => p.type === obj.partType && (!obj.partSide || p.side === obj.partSide))
      }
      if (snap) {
        if (Math.abs(obj.left - snap.x) < threshold && Math.abs(obj.top - snap.y) < threshold) {
          obj.left = snap.x
          obj.top = snap.y
        }
      }
    }
    fabricCanvas.on('object:moving', onMoving)

    // Tăng borderWidth cho active object
    fabricCanvas.on('selection:created', (e: any) => {
      if (e.target) {
        e.target.set({ borderColor: '#ec4899', borderScaleFactor: 2, borderDashArray: [6, 2], borderWidth: 4 })
        fabricCanvas.renderAll()
      }
    })
    fabricCanvas.on('selection:updated', (e: any) => {
      if (e.target) {
        e.target.set({ borderColor: '#ec4899', borderScaleFactor: 2, borderDashArray: [6, 2], borderWidth: 4 })
        fabricCanvas.renderAll()
      }
    })

    return () => {
      fabricCanvas.off('object:moving', onMoving)
      fabricCanvas.off('selection:created')
      fabricCanvas.off('selection:updated')
    }
  }, [selectedOptions, categories, canvasJSON, hasLoadedFromJSON, justRestored, backgroundImage])

  // Khi vẽ lại text từ customTexts, xóa toàn bộ textbox cũ trước khi add lại
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    // XÓA toàn bộ textbox cũ trước khi add lại
    canvas.getObjects()
      .filter((obj: any) => obj.type === 'textbox')
      .forEach((obj: any) => canvas.remove(obj));
    // Thêm lại từ customTexts
    customTexts.forEach(t => {
      let textbox = new fabric.Textbox(t.text, {
        left: t.left,
        top: t.top,
        fill: t.fill,
        fontSize: t.fontSize,
        fontFamily: t.fontFamily,
        editable: true,
        fontWeight: 'bold',
        borderColor: '#f472b6',
        cornerColor: '#f472b6',
        cornerSize: 8,
        transparentCorners: false,
        padding: 4,
        lockUniScaling: false,
      });
      textbox.customId = t.id;
      canvas.add(textbox);
    });
    canvas.renderAll();
  }, [customTexts]);

  // Ngăn không cho chọn, kéo, scale, xoay body trong mọi trường hợp
  useEffect(() => {
    const fabricCanvas = fabricCanvasRef.current;
    if (!fabricCanvas) return;
    const preventBodySelect = (e: any) => {
      if (e.target && e.target.partType === 'body') {
        fabricCanvas.discardActiveObject();
        fabricCanvas.renderAll();
      }
    };
    const preventBodyMove = (e: any) => {
      if (e.target && e.target.partType === 'body') {
        e.target.left = 0;
        e.target.top = 0;
        fabricCanvas.discardActiveObject();
        fabricCanvas.renderAll();
        return false;
      }
    };
    fabricCanvas.on('mouse:down', preventBodySelect);
    fabricCanvas.on('object:selected', preventBodySelect);
    fabricCanvas.on('object:moving', preventBodyMove);
    fabricCanvas.on('object:scaling', preventBodyMove);
    fabricCanvas.on('object:rotating', preventBodyMove);
    return () => {
      fabricCanvas.off('mouse:down', preventBodySelect);
      fabricCanvas.off('object:selected', preventBodySelect);
      fabricCanvas.off('object:moving', preventBodyMove);
      fabricCanvas.off('object:scaling', preventBodyMove);
      fabricCanvas.off('object:rotating', preventBodyMove);
    };
  }, []);

  return (
    <canvas ref={canvasRef} width={500} height={650} className="rounded-lg" />
  )
})

export default CustomFabricCanvas 