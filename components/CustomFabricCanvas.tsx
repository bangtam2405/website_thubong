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

const CustomFabricCanvas = forwardRef(function CustomFabricCanvas({ selectedOptions, categories, canvasJSON, backgroundImage, customTexts = [], onCustomTextsChange, onAccessoryAdd }: { 
  selectedOptions: any, 
  categories: Category[], 
  canvasJSON?: any,
  backgroundImage?: string,
  customTexts?: { id: string, text: string, fill: string, fontSize: number, fontFamily: string, left: number, top: number }[],
  onCustomTextsChange?: (texts: any[]) => void,
  onAccessoryAdd?: (accId: string) => void,
}, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<any>(null)
  // Lưu trạng thái từng part (vị trí, scale, góc xoay...)
  const partStatesRef = useRef<{ [id: string]: any }>({})
  const [hasLoadedFromJSON, setHasLoadedFromJSON] = useState(false)
  const [justRestored, setJustRestored] = useState(false)
  const clipboardRef = useRef<any>(null);
  const clipboardOriginalPartIdRef = useRef<string | null>(null);
  const clipboardOriginalObjectRef = useRef<any>(null);

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
    console.log('[CustomFabricCanvas] selectedOptions.eyes:', selectedOptions.eyes);

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
                           selectedOptions.clothing || (selectedOptions.accessories && Object.keys(selectedOptions.accessories).length > 0);
    
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
      console.log('addPart CALLED', { id, type });
      const url = getImageUrl(id)
      console.log('Add part', { id, type, url }); // debug
      if (!url) return
      let snap
      if (type === 'accessory') {
        const accessorySnaps = snapPoints.filter(p => p.type === 'accessory')
        snap = accessorySnaps[accessoryIndex ?? 0] || { x: 0, y: 0, type }
        
        // Kiểm tra xem accessory này đã tồn tại chưa
        const existingAccessory = fabricCanvasRef.current.getObjects().find((obj: any) => 
          obj.partType === 'accessory' && obj.partId === id && obj.accessoryIndex === accessoryIndex
        );
        if (existingAccessory) {
          console.log('Accessory already exists, skipping creation');
          return;
        }
      } else {
        snap = snapPoints.find(p => p.type === type && (!side || p.side === side)) || { x: 0, y: 0, type }
      }

      // XÓA toàn bộ object cùng partType cũ trước khi add part mới (trừ accessory)
      if (type !== 'accessory') {
        const objsToRemove = fabricCanvasRef.current.getObjects().filter((obj: any) => obj.partType === type);
        objsToRemove.forEach((obj: any) => fabricCanvasRef.current.remove(obj));
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
          // Tính toán scale để mọi part có kích thước đồng nhất
          const maxWidth = 150; // px, có thể chỉnh nhỏ hơn nếu muốn
          const maxHeight = 150;
          const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);

          fabricImage.set({
            left: fabricCanvas.width / 2,
            top: fabricCanvas.height / 2,
            originX: 'center',
            originY: 'center',
            scaleX: scale,
            scaleY: scale,
            selectable: true,
            evented: true,
            partType: type,
            partSide: side || null,
            partId: id,
            accessoryIndex: accessoryIndex,
          })
          // Nếu đã có trạng thái cũ thì apply lại
          let state = partStatesRef.current[id];
          // Ưu tiên lấy vị trí cuối cùng của partType (ví dụ 'eyes') nếu có
          if (!state && partStatesRef.current[type]) {
            state = { ...partStatesRef.current[type] };
            partStatesRef.current[id] = state;
          } else if (!state && partStatesRef.current[`${type}_initial`]) {
            // Nếu chưa có state cho id mới, ưu tiên lấy vị trí gốc từ JSON
            state = { ...partStatesRef.current[`${type}_initial`] };
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
        if (type === 'eyes') {
          const eyesObjs = fabricCanvasRef.current.getObjects().filter((obj: any) => obj.partType === 'eyes');
          console.log('DEBUG số lượng object eyes trên canvas:', eyesObjs.length);
        }
      }
      img.onerror = (err) => {
        console.error('Error loading image:', err)
      }
      img.src = url
    }

    // Helper: clear all objects of a partType before adding new one
    function clearPartType(type: string) {
      if (fabricCanvasRef.current) {
        const objsToRemove = fabricCanvasRef.current.getObjects().filter((obj: any) => obj.partType === type);
        objsToRemove.forEach((obj: any) => fabricCanvasRef.current.remove(obj));
      }
    }

    // Helper: check if option changed for a part type
    function hasOptionChanged(type: string, currentOption: string) {
      const existingObj = fabricCanvasRef.current.getObjects().find((obj: any) => obj.partType === type);
      // Nếu không có object nào hoặc object có partId khác với currentOption
      return !existingObj || existingObj.partId !== currentOption;
    }

    // Helper: preserve existing object position if option hasn't changed
    function preserveExistingObject(type: string, currentOption: string) {
      const existingObj = fabricCanvasRef.current.getObjects().find((obj: any) => obj.partType === type);
      if (existingObj && existingObj.partId === currentOption) {
        // Giữ nguyên object hiện tại, không tạo lại
        return true;
      }
      return false;
    }

    // 1. Body
    if (selectedOptions.body) {
      if (!preserveExistingObject('body', selectedOptions.body)) {
        clearPartType('body');
        addPart(selectedOptions.body, 'body');
      }
    }
    // 2. Ears
    if (selectedOptions.ears) {
      if (!preserveExistingObject('ears', selectedOptions.ears)) {
        clearPartType('ears');
        addPart(selectedOptions.ears, 'ears');
      }
    }
    // 3. Eyes
    if (selectedOptions.eyes) {
      if (!preserveExistingObject('eyes', selectedOptions.eyes)) {
        clearPartType('eyes');
        addPart(selectedOptions.eyes, 'eyes');
        if (fabricCanvasRef.current) {
          const eyesObjs = fabricCanvasRef.current.getObjects().filter((obj: any) => obj.partType === 'eyes');
          if (eyesObjs.length > 1) {
            eyesObjs.slice(0, -1).forEach((obj: any) => fabricCanvasRef.current.remove(obj));
          }
        }
      }
    }
    // 4. Nose
    if (selectedOptions.nose) {
      if (!preserveExistingObject('nose', selectedOptions.nose)) {
        clearPartType('nose');
        addPart(selectedOptions.nose, 'nose');
      }
    }
    // Debug: Kiểm tra selectedOptions.mouth và categories (miệng)
    console.log('[CustomFabricCanvas] selectedOptions.mouth:', selectedOptions.mouth);
    console.log('[CustomFabricCanvas] categories (mouth):', categories.filter(c => c.name && c.name.toLowerCase().includes('miệng')));
    // 5. Mouth
    if (selectedOptions.mouth) {
      if (!preserveExistingObject('mouth', selectedOptions.mouth)) {
        clearPartType('mouth');
        addPart(selectedOptions.mouth, 'mouth');
      }
    }
    // 6. Clothing
    if (selectedOptions.clothing) {
      if (!preserveExistingObject('clothing', selectedOptions.clothing)) {
        clearPartType('clothing');
        addPart(selectedOptions.clothing, 'clothing');
      }
    }
    // 7. Accessories (mảng)
    if (selectedOptions.accessories && Object.keys(selectedOptions.accessories).length > 0) {
      // Không xóa accessories cũ, chỉ thêm mới hoặc cập nhật
      const existingAccessories = fabricCanvas.getObjects().filter((obj: any) => obj.partType === 'accessory');
      const existingAccessoryIds = new Set(existingAccessories.map((obj: any) => obj.partId));
      
      // Tính tổng số accessories hiện tại để làm base index
      let totalAccessoryIndex = 0;
      Object.entries(selectedOptions.accessories).forEach(([accId, quantity]) => {
        const neededCount = quantity as number;
        totalAccessoryIndex += neededCount;
      });
      
      // Xử lý từng loại accessory
      let currentIndex = 0;
      Object.entries(selectedOptions.accessories).forEach(([accId, quantity]) => {
        const existingAccessoriesOfType = existingAccessories.filter((obj: any) => obj.partId === accId);
        const existingCount = existingAccessoriesOfType.length;
        const neededCount = quantity as number;
        
        if (neededCount > existingCount) {
          // Thêm accessories mới
          for (let i = existingCount; i < neededCount; i++) {
            addPart(accId, 'accessory', undefined, currentIndex);
            currentIndex++;
          }
        } else if (neededCount < existingCount) {
          // Xóa accessories thừa (giữ lại những cái đầu tiên)
          const accessoriesToRemove = existingAccessoriesOfType.slice(neededCount);
          accessoriesToRemove.forEach((obj: any) => fabricCanvas.remove(obj));
        }
        
        // Cập nhật accessoryIndex cho các accessories đã tồn tại
        const startIndex = currentIndex;
        existingAccessoriesOfType.slice(0, Math.min(existingCount, neededCount)).forEach((obj: any, index: number) => {
          obj.accessoryIndex = startIndex + index;
        });
        
        currentIndex += neededCount;
      });
      
      // Xóa accessories không còn trong selectedOptions
      existingAccessories.forEach((obj: any) => {
        if (!selectedOptions.accessories[obj.partId]) {
          fabricCanvas.remove(obj);
        }
      });
    } else {
      // Nếu không có accessories nào, xóa tất cả
      clearPartType('accessory');
    }

    // Snap-to-position khi kéo part - TẠM TẮT ĐỂ CÓ THỂ KÉO TỰ DO
    // const onMoving = (e: any) => {
    //   const obj = e.target
    //   if (!obj || !obj.partType) return
    //   const threshold = 30
    //   // Tìm snap point phù hợp
    //   let snap
    //   if (obj.partType === 'accessory') {
    //     const accessorySnaps = snapPoints.filter(p => p.type === 'accessory')
    //     // Sử dụng accessoryIndex trực tiếp từ object
    //     const accessoryIndex = obj.accessoryIndex || 0;
    //     snap = accessorySnaps[accessoryIndex] || { x: 0, y: 0, type: 'accessory' }
    //   } else {
    //     snap = snapPoints.find(p => p.type === obj.partType && (!obj.partSide || p.side === obj.partSide))
    //   }
    //   if (snap) {
    //     if (Math.abs(obj.left - snap.x) < threshold && Math.abs(obj.top - snap.y) < threshold) {
    //       obj.left = snap.x
    //       obj.top = snap.y
    //     }
    //   }
    // }
    // fabricCanvas.on('object:moving', onMoving)

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
      // fabricCanvas.off('object:moving', onMoving) // Đã comment vì tắt snap
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

  // Thêm useEffect lắng nghe Ctrl+C/Ctrl+V
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      // Chỉ thao tác khi canvas đang focus hoặc object đang được chọn
      const activeObj = canvas.getActiveObject();
      if (e.ctrlKey && e.key.toLowerCase() === 'c') {
        if (activeObj && activeObj.partType !== 'body') {
          activeObj.clone((cloned: any) => {
            clipboardRef.current = cloned;
            clipboardOriginalObjectRef.current = activeObj;
            clipboardOriginalPartIdRef.current = activeObj.partId || null;
          });
          e.preventDefault();
        }
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'v') {
        if (clipboardOriginalObjectRef.current) {
          clipboardOriginalObjectRef.current.clone((clonedObj: any) => {
            clonedObj.set({
              left: (clonedObj.left || 0) + 30,
              top: (clonedObj.top || 0) + 30,
              evented: true,
              selectable: true,
            });
            if (clonedObj.partId) {
              clonedObj.partId = clonedObj.partId + '_copy_' + Date.now();
            }
            if (clonedObj.partType === 'accessory' && typeof onAccessoryAdd === 'function' && clipboardOriginalPartIdRef.current) {
              onAccessoryAdd(clipboardOriginalPartIdRef.current);
            }
            canvas.add(clonedObj);
            canvas.setActiveObject(clonedObj);
            canvas.renderAll();
          });
          e.preventDefault();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <canvas ref={canvasRef} width={500} height={650} className="rounded-lg" />
  )
})

export default CustomFabricCanvas 