import React from "react";
import { Trash2 } from "lucide-react";

type Props = {
  handleClick: (e: React.MouseEvent) => void;
};
const DeleteButton = ({ handleClick }: Props) => {
  return (
    <div
      onClick={handleClick}
      className="text-red-600 hover:bg-red-100 p-2 rounded-md cursor-pointer"
    >
      <div>
        <Trash2 className="w-4 h-4" />
      </div>
    </div>
  );
};

export default DeleteButton;
