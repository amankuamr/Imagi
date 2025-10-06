"use client";
import { useState } from "react";
import { ChevronDown, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FilterDropdownProps {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  placeholder: string;
}

export default function FilterDropdown({ options, selected, onSelect, placeholder }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-white hover:text-purple-400 transition-colors duration-200 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 shadow-lg"
        aria-label={placeholder}
      >
        <Filter size={16} className="mr-2" />
        <span className="text-sm font-medium">{selected}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-2"
        >
          <ChevronDown size={14} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full mt-2 right-0 w-48 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl overflow-hidden z-60"
          >
            <div className="py-2">
              {options.map((option) => (
                <button
                  key={option}
                  className="w-full flex items-center px-4 py-3 text-white hover:bg-white/10 transition-colors duration-200 text-left text-sm"
                  onClick={() => {
                    onSelect(option);
                    setIsOpen(false);
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
