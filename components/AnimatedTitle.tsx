import { motion } from "framer-motion";
import React from "react";

export default function AnimatedTitle({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <motion.h1
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.h1>
  );
} 