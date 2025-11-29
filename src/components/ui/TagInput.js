import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const tagVariants = {
  initial: { opacity: 0, scale: 0.8, x: -10 },
  animate: { opacity: 1, scale: 1, x: 0 },
  exit: { opacity: 0, scale: 0.8, x: 10 },
};

export const TagInput = ({
  value = [],
  onChange,
  placeholder = "Type a skill and press Enter",
  maxTags,
  ...props
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleAddTag = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // Check if tag already exists
    if (value.some((tag) => tag.toLowerCase() === trimmed.toLowerCase())) {
      setInputValue("");
      return;
    }

    // Check max tags limit
    if (maxTags && value.length >= maxTags) {
      setInputValue("");
      return;
    }

    onChange([...value, trimmed]);
    setInputValue("");
  };

  const handleRemoveTag = (indexToRemove) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      // Remove last tag if input is empty and backspace is pressed
      handleRemoveTag(value.length - 1);
    }
  };

  return (
    <div className="w-full" {...props}>
      <div className="relative flex items-center gap-sm">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            value.length === 0 ? placeholder : "Add another skill..."
          }
          disabled={maxTags && value.length >= maxTags}
          className="flex-1 px-md py-sm border border-gray-300 rounded-md text-base box-border transition-all duration-fast focus:outline-none focus:border-primary focus:ring-2 focus:ring-primaryLight/20 placeholder:text-gray-400 disabled:opacity-50"
        />
        {inputValue.trim() && (
          <motion.button
            type="button"
            onClick={handleAddTag}
            disabled={maxTags && value.length >= maxTags}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-md py-sm bg-primary text-white border-none rounded-md text-sm font-medium cursor-pointer transition-colors duration-fast whitespace-nowrap hover:bg-primaryDark disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primaryLight/20"
          >
            Add
          </motion.button>
        )}
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-xs mt-xs items-start justify-start">
          <AnimatePresence>
            {value.map((tag, index) => (
              <motion.span
                key={`${tag}-${index}`}
                variants={tagVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary text-white rounded-full text-xs font-medium whitespace-nowrap text-left"
              >
                <span
                  className="max-w-[200px] overflow-hidden text-ellipsis text-left"
                  title={tag}
                >
                  {tag}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(index)}
                  aria-label={`Remove ${tag}`}
                  className="flex items-center justify-center bg-transparent border-none text-white cursor-pointer p-0 ml-1 w-3.5 h-3.5 rounded-full transition-colors duration-fast text-xs leading-none hover:bg-white/20 focus:outline-none focus:bg-white/30"
                >
                  ×
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default TagInput;
