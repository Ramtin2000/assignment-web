import React from "react";
import { motion } from "framer-motion";

export const MetricsCard = ({ title, items = [], valueSuffix = "/10" }) => {
  if (!items || items.length === 0) return null;

  return (
    <motion.div className="bg-white rounded-lg p-lg shadow-sm transition-all duration-normal border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-2 m-0 text-left">
        {title}
      </h3>
      <div className="text-gray-700 leading-relaxed text-left">
        <ul className="list-none p-0 m-0 flex flex-col gap-xs">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex justify-between items-center text-sm text-gray-700"
            >
              <span className="font-medium">{item.label}</span>
              <span>
                <span className="text-gray-900 font-semibold">
                  {item.averageScore.toFixed(1)}
                  {valueSuffix}
                </span>
                <span className="text-xs text-gray-500 ml-xs">
                  · {item.questionCount} question
                  {item.questionCount !== 1 ? "s" : ""}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

export default MetricsCard;
