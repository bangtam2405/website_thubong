import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Trash2, AlertTriangle } from "lucide-react"

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  productName: string
  isLoading?: boolean
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  productName,
  isLoading = false
}: DeleteConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">Xác nhận xóa sản phẩm</DialogTitle>
              <DialogDescription className="text-gray-600">
                Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-700 mb-2">Sản phẩm sẽ bị xóa:</p>
            <p className="font-medium text-gray-900">{productName}</p>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Hành động này không thể hoàn tác. Sản phẩm sẽ bị xóa vĩnh viễn khỏi giỏ hàng của bạn.
          </p>
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Hủy bỏ
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-red-500 hover:bg-red-600"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Đang xóa...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Xóa sản phẩm
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
