"use client";
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Chỉ log lỗi thực sự, bỏ qua lỗi extension
    if (!error.message.includes('runtime.lastError') && 
        !error.message.includes('Receiving end does not exist')) {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Nếu là lỗi extension, không hiển thị fallback
      if (this.state.error?.message.includes('runtime.lastError') || 
          this.state.error?.message.includes('Receiving end does not exist')) {
        return this.props.children;
      }

      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Có lỗi xảy ra
            </h2>
            <p className="text-gray-600 mb-4">
              Vui lòng thử tải lại trang hoặc liên hệ hỗ trợ.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}