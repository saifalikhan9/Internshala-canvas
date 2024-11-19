import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Text } from "react-konva";
import TextEditorToolbar from "./Toolbar";

const Canvas = () => {
  const [shapes, setShapes] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [inputPosition, setInputPosition] = useState({ x: 0, y: 0 });
  const [selectedId, setSelectedId] = useState(null);
  const [textStyle, setTextStyle] = useState({
    fontFamily: "Arial",
    fontSize: 16,
    fill: "black",
    fontStyle: "normal",
    textDecoration: "",
    align: "left",
  });

  const [history, setHistory] = useState([[]]);  // Start with empty shapes array
  const [currentStep, setCurrentStep] = useState(0);
  const stageRef = useRef();

  // Make undo/redo functions available globally
  useEffect(() => {
    window.canvasUndo = handleUndo;
    window.canvasRedo = handleRedo;

    return () => {
      window.canvasUndo = undefined;
      window.canvasRedo = undefined;
    };
  }, [currentStep, history]);

  // Save state to history
  const saveToHistory = (newShapes) => {
    // Remove any future states
    const newHistory = history.slice(0, currentStep + 1);
    setHistory([...newHistory, newShapes]);
    setCurrentStep(currentStep + 1);
    setShapes(newShapes);
  };

  const handleUndo = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      setShapes(history[newStep]);
    }
  };

  const handleRedo = () => {
    if (currentStep < history.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      setShapes(history[newStep]);
    }
  };

  // Handle canvas click
  const handleStageClick = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
      const stage = stageRef.current.getStage();
      const pointerPosition = stage.getPointerPosition();

      setInputPosition({
        x: pointerPosition.x,
        y: pointerPosition.y,
      });

      setInputValue("");
      setIsInputVisible(true);
    }
  };

  // Handle text selection
  const handleTextClick = (e, id) => {
    e.cancelBubble = true;
    setSelectedId(id);
    setIsInputVisible(false);
  };

  // Handle input submission with history
  const handleInputSubmit = () => {
    if (inputValue.trim()) {
      const newShapes = [
        ...shapes,
        {
          id: Date.now(),
          x: inputPosition.x,
          y: inputPosition.y,
          text: inputValue,
          ...textStyle,
        },
      ];
      saveToHistory(newShapes);
    }
    setIsInputVisible(false);
  };

  // Handle text drag end
  const handleDragEnd = (e, id) => {
    const newShapes = shapes.map(shape => {
      if (shape.id === id) {
        return {
          ...shape,
          x: e.target.x(),
          y: e.target.y(),
        };
      }
      return shape;
    });
    saveToHistory(newShapes);
  };

  // Handle toolbar updates
  const handleUpdateText = (updates) => {
    const newStyle = { ...textStyle };

    if (updates.font) newStyle.fontFamily = updates.font;
    if (updates.size) newStyle.fontSize = parseInt(updates.size);
    if (updates.color) newStyle.fill = updates.color;
    if (updates.bold !== undefined) {
      newStyle.fontStyle = newStyle.fontStyle.includes("italic")
        ? updates.bold ? "bold italic" : "italic"
        : updates.bold ? "bold" : "normal";
    }
    if (updates.italic !== undefined) {
      newStyle.fontStyle = newStyle.fontStyle.includes("bold")
        ? updates.italic ? "bold italic" : "bold"
        : updates.italic ? "italic" : "normal";
    }
    if (updates.underline !== undefined) {
      newStyle.textDecoration = updates.underline ? "underline" : "";
    }
    if (updates.align) newStyle.align = updates.align;

    setTextStyle(newStyle);

    if (selectedId !== null) {
      const newShapes = shapes.map(shape =>
        shape.id === selectedId ? { ...shape, ...newStyle } : shape
      );
      saveToHistory(newShapes);
    }
  };

  return (
    <div className="relative">
      <div className="absolute top-4 left-4 z-10">
        <TextEditorToolbar onUpdateText={handleUpdateText} />
      </div>

      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        ref={stageRef}
        onClick={handleStageClick}
      >
        <Layer>
          {shapes.map((shape) => (
            <Text
              key={shape.id}
              id={shape.id}
              x={shape.x}
              y={shape.y}
              text={shape.text}
              fontSize={shape.fontSize || textStyle.fontSize}
              fontFamily={shape.fontFamily || textStyle.fontFamily}
              fill={shape.fill || textStyle.fill}
              fontStyle={shape.fontStyle || textStyle.fontStyle}
              textDecoration={shape.textDecoration || textStyle.textDecoration}
              align={shape.align || textStyle.align}
              draggable
              onClick={(e) => handleTextClick(e, shape.id)}
              onTap={(e) => handleTextClick(e, shape.id)}
              onDragEnd={(e) => handleDragEnd(e, shape.id)}
              perfectDrawEnabled={true}
              shadowEnabled={true}
              shadowColor={
                selectedId === shape.id ? "rgba(0,0,0,0.2)" : "transparent"
              }
              shadowBlur={selectedId === shape.id ? 10 : 0}
              shadowOffset={{ x: 0, y: 0 }}
            />
          ))}
        </Layer>
      </Stage>

      {isInputVisible && (
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleInputSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleInputSubmit();
          }}
          style={{
            position: "absolute",
            top: inputPosition.y,
            left: inputPosition.x,
            transform: "translate(-50%, -50%)",
            padding: "4px 8px",
            fontSize: `${textStyle.fontSize}px`,
            fontFamily: textStyle.fontFamily,
            color: textStyle.fill,
            fontStyle: textStyle.fontStyle,
            textDecoration: textStyle.textDecoration,
            textAlign: textStyle.align,
            zIndex: 10,
          }}
          autoFocus
        />
      )}
    </div>
  );
};

export default Canvas;