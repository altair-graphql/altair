import React, { useState } from 'react';
import './accordion.css';

interface AccordionItemProp {
  id: string;
  title: string | React.ReactNode;
  content: React.ReactNode;
}
interface AccordionProps {
  sections: AccordionItemProp[];
  allExpanded?: boolean;
}
export const Accordion: React.FC<AccordionProps> = ({ sections, allExpanded }) => {
  const [expandedSections, setExpandedSections] = useState(
    new Set(allExpanded ? sections.map((s) => s.id) : [])
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };
  return (
    <div>
      {sections.map(({ id, title, content }) => (
        <div key={id} className="accordion-section">
          <button className="accordion-header" onClick={() => toggleSection(id)}>
            <svg
              className={`accordion-icon ${expandedSections.has(id) ? 'expanded' : ''}`}
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M6 12l4-4-4-4" />
            </svg>
            <span className="accordion-title">{title}</span>
            {/* <span className="accordion-count">({Object.keys(items).length})</span> */}
          </button>

          {expandedSections.has(id) && (
            <div className="accordion-content">
              {content}
              {/* {Object.entries(items).map(([key, value]) => (
                <div key={key} className="header-row">
                  <div className="header-name">{key}</div>
                  <div className="header-value">{value}</div>
                </div>
              ))} */}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
