import React, { useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";

const TagInputContainer = styled.div`
  width: 100%;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${(props) => props.theme.spacing.xs};
  margin-top: ${(props) => props.theme.spacing.xs};
  align-items: flex-start;
  justify-content: flex-start;
`;

const Tag = styled(motion.span)`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.white};
  border-radius: ${(props) => props.theme.borderRadius.full};
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  text-align: left;
`;

const TagText = styled.span`
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: ${(props) => props.theme.colors.white};
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  transition: background-color ${(props) => props.theme.transitions.fast};
  font-size: 12px;
  line-height: 1;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.3);
  }
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
`;

const StyledInput = styled.input`
  flex: 1;
  padding: ${(props) => props.theme.spacing.sm}
    ${(props) => props.theme.spacing.md};
  border: 1px solid ${(props) => props.theme.colors.gray[300]};
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: 1rem;
  box-sizing: border-box;
  transition: all ${(props) => props.theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${(props) => props.theme.colors.primaryLight}33;
  }

  &::placeholder {
    color: ${(props) => props.theme.colors.gray[400]};
  }
`;

const AddButton = styled(motion.button)`
  padding: ${(props) => props.theme.spacing.sm}
    ${(props) => props.theme.spacing.md};
  background: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.white};
  border: none;
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color ${(props) => props.theme.transitions.fast};
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: ${(props) => props.theme.colors.primaryDark};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${(props) => props.theme.colors.primaryLight}33;
  }
`;

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
    <TagInputContainer {...props}>
      <InputWrapper>
        <StyledInput
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            value.length === 0 ? placeholder : "Add another skill..."
          }
          disabled={maxTags && value.length >= maxTags}
        />
        {inputValue.trim() && (
          <AddButton
            type="button"
            onClick={handleAddTag}
            disabled={maxTags && value.length >= maxTags}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Add
          </AddButton>
        )}
      </InputWrapper>
      {value.length > 0 && (
        <TagsContainer>
          <AnimatePresence>
            {value.map((tag, index) => (
              <Tag
                key={`${tag}-${index}`}
                variants={tagVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2 }}
              >
                <TagText title={tag}>{tag}</TagText>
                <RemoveButton
                  type="button"
                  onClick={() => handleRemoveTag(index)}
                  aria-label={`Remove ${tag}`}
                >
                  ×
                </RemoveButton>
              </Tag>
            ))}
          </AnimatePresence>
        </TagsContainer>
      )}
    </TagInputContainer>
  );
};

export default TagInput;
