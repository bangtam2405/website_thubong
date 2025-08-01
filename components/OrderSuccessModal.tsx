"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

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
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
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
                  className={`w-2 h-2 rounded-full ${
                    ['bg-pink-400', 'bg-rose-400', 'bg-purple-400', 'bg-blue-400', 'bg-green-400'][
                      Math.floor(Math.random() * 5)
                    ]
                  }`}
                />
              </div>
            ))}
          </div>
        )}

        <div className="relative bg-gradient-to-br from-white to-pink-50 p-8">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              {/* Outer ring animation */}
              <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full animate-ping opacity-20"></div>
              <div className="absolute inset-2 w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full animate-pulse"></div>
              
              {/* Checkmark */}
              <div className="relative w-20 h-20 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full flex items-center justify-center shadow-lg">
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
                  Mã đơn hàng: <span className="font-mono font-semibold text-pink-600">{orderId}</span>
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 animate-fade-in" style={{ animationDelay: '0.9s' }}>
            <Button
              onClick={handleContinueShopping}
              className="w-full h-12 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Tiếp tục mua sắm
            </Button>
            
            <Button
              onClick={handleViewOrders}
              variant="outline"
              className="w-full h-12 border-2 border-pink-200 text-pink-600 hover:bg-pink-50 hover:border-pink-300 font-semibold rounded-xl transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Xem đơn hàng của tôi
            </Button>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full opacity-50"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full opacity-50"></div>
        </div>
      </DialogContent>

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