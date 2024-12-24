import { useContext, useCallback, useEffect } from "react";
import { ViewerContext } from "./vrmViewer/viewerContext";
import { buildUrl } from "../utils/buildUrl";
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';

export default function VrmViewer() {
  const { viewer } = useContext(ViewerContext);
  const theme = useTheme();

  useEffect(() => {
    if (viewer) {
      viewer.updateLighting(theme.palette.mode === 'dark');
    }
  }, [viewer, theme.palette.mode]);

  const canvasRef = useCallback(
    (canvas: HTMLCanvasElement) => {
      if (canvas) {
        viewer.setup(canvas);
        viewer.loadVrm(buildUrl("/vrm/Miko.vrm"));

        // Drag and DropでVRMを差し替え
        canvas.addEventListener("dragover", function (event) {
          event.preventDefault();
        });

        canvas.addEventListener("drop", function (event) {
          event.preventDefault();

          const files = event.dataTransfer?.files;
          if (!files) {
            return;
          }

          const file = files[0];
          if (!file) {
            return;
          }

          const file_type = file.name.split(".").pop();
          if (file_type === "vrm") {
            const blob = new Blob([file], { type: "application/octet-stream" });
            const url = window.URL.createObjectURL(blob);
            viewer.loadVrm(url);
          }
        });
      }
    },
    [viewer]
  );

  return (
    <Box sx={{ 
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: 'calc(100vh)', // 减去底部聊天区域的高度
      zIndex: 0,
    }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }}></canvas>
    </Box>
  );
}
