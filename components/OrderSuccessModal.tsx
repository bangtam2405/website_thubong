"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"

interface OrderSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  orderId?: string
}

export default function OrderSuccessModal({ isOpen, onClose, orderId }: OrderSuccessModalProps) {
  const router = useRouter()
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true)
      // Tắt confetti sau 3 giây
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleContinueShopping = () => {
    onClose()
    router.push('/')
  }

  const handleViewOrders = () => {
    onClose()
    router.push('/orders')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
            "sm:max-w-md p-0 overflow-hidden"
          )}
        >
          <DialogTitle className="sr-only">Đặt hàng thành công</DialogTitle>
        {/* Confetti Animation */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`,
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{backgroundColor: '#E3497A'}}
                />
              </div>
            ))}
          </div>
        )}

        <div className="relative bg-white p-8">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200 group"
            title="Đóng"
          >
            <FontAwesomeIcon 
              icon={faXmark} 
              className="w-4 h-4 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" 
            />
          </button>
          
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              {/* Outer ring animation */}
              <div className="absolute inset-0 w-20 h-20 rounded-full animate-ping opacity-20" style={{backgroundColor: '#E3497A'}}></div>
              <div className="absolute inset-2 w-16 h-16 rounded-full animate-pulse" style={{backgroundColor: '#E3497A'}}></div>
              
              {/* Checkmark */}
              <div className="relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg" style={{backgroundColor: '#E3497A'}}>
                <svg
                  className="w-10 h-10 text-white animate-bounce"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ animationDelay: '0.5s' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3 animate-fade-in">
              Đặt hàng thành công!
            </h2>
            <p className="text-gray-600 leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
              Cảm ơn bạn đã tin tưởng chúng tôi. Đơn hàng của bạn đang được xử lý và sẽ sớm được giao đến bạn.
            </p>
            {orderId && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg inline-block animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <p className="text-sm text-gray-600">
                  Mã đơn hàng: <span className="font-mono font-semibold" style={{color: '#E3497A'}}>{orderId}</span>
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 animate-fade-in" style={{ animationDelay: '0.9s' }}>
            <Button
              onClick={handleContinueShopping}
              className="w-full h-12 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              style={{backgroundColor: '#E3497A'}}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Tiếp tục mua sắm
            </Button>
            
            <Button
              onClick={handleViewOrders}
              variant="outline"
              className="w-full h-12 border-2 font-semibold rounded-xl transition-all duration-300"
              style={{borderColor: '#E3497A', color: '#E3497A'}}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Xem đơn hàng của tôi
            </Button>
          </div>

          {/* Decorative elements */}
          {/* <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full opacity-50"></div> */}
        </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </Dialog>
  )
} 