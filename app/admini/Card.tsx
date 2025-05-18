import React from "react";
interface CardProps {
  head: string;
  text: string;
  icon: React.ReactNode;
}

const Card = ({ head, text, icon }: CardProps) => {
  return (
    <div>
      <div className="info bg-blue-300 rounded-lg p-4  w-3xl ">
        <div className="flex">
          <p className="speed">icon</p>
          <p className="pl-1.5">{head}</p>
        </div>

        <p style={{ fontSize: "24px", fontWeight: "700" }}>{text}</p>
      </div>
    </div>
  );
};

export default Card;
