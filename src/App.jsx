import React from "react";
import Canvas from "./components/Canvas";
import {Button} from './components/ui/button'

const App = () => {

  const handleUndo = () => {
    if (window.canvasUndo) {
      window.canvasUndo();
    }
  };

  const handleRedo = () => {
    if (window.canvasRedo) {
      window.canvasRedo();
    }
  };
  return (
    <>
      <header className=" mx-1 px-1 p-1 shadow-md">
        <div className="flex items-center ">
          <div>
            <img
              className=" w-28"
              src="https://img.freepik.com/free-vector/abstract-logo-flame-shape_1043-44.jpg?t=st=1732005600~exp=1732009200~hmac=e7ee6142c9658c3f73ee2d335d02a82712b3463e81707f59cfb4f96120b6b005&w=740"
              alt=""
            />
          </div>
          <div className="w-full flex justify-center gap-5 ">
          <Button onClick={handleUndo}>Undo</Button>
          <Button onClick={handleRedo}>Redo</Button>
          </div>
        </div>
      </header>
      <Canvas />
    </>
  );
};
export default App;
