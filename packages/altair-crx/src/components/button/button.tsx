import React, { PropsWithChildren } from 'react';
import './button.css';

interface ButtonProps {
  onPress?: () => void;
}
export const Button: React.FC<PropsWithChildren<ButtonProps>> = ({
  children,
  onPress = () => {},
}) => {
  return (
    <button className="btn" onClick={() => onPress()}>
      {children}
    </button>
  );
};
