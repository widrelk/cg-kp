import './App.css';

import React, { useState, useRef } from 'react';
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Plane, } from "@react-three/drei";
import { DoubleSide } from "three";

const Background = () => {
  const { gl } = useThree();

  gl.setClearColor(0x87ceeb, 1);
  return null
}

const Map = () => {
  let mapRef = useRef();
  useFrame(({ clock }) => {
    mapRef.current.rotation.y = (clock.getElapsedTime() / 12);
  })

  let meshSizeW = 600;
  let meshSizeH = 600;
  const [gridH, setGridH] = useState(7);
  const [gridW, setGridW] = useState(7);
  const [smoothness, setSmoothness] = useState(15);
  const [elevation, setElevation] = useState(1.15);

  const makeGrid = (width, height) => {
    let grid = [];
    for (let row = 0; row < height; row++) {
      let currRow = [];
      for (let column = 0; column < width; column++) {
        let angle = Math.random() * Math.PI * 2;
        let x = Math.cos(angle);
        let y = Math.sin(angle);
        currRow.push({ x, y, angle })
      }
      grid.push(currRow);
    }
    return (grid);
  }

  let grid = makeGrid(gridW, gridH);

  const makeNoise = (gradientGrid, targetW, targetH, elev, smoothCoeff) => {
    let squareH = targetH / (gridH - 1);    // Т.к. 2 ряда сетки образуют один квадрат
    let stepH = squareH / smoothCoeff;
    let squareW = targetW / (gridW - 1);
    let stepW = squareW / smoothCoeff;

    let noise = []

    for (let y = 0; y < (gridH - 1) * smoothCoeff; y++) {
      let noiseRow = []
      for (let x = 0; x < (gridW - 1) * smoothCoeff; x++) {
        // Ищем левый верхний угол квадрата
        let gridX = Math.floor(x / smoothCoeff);
        let gridY = Math.floor(y / smoothCoeff);

        // Координаты точки внутри большого квадрата относительно TopLeft
        let pointX = x * stepW - gridX * squareW;
        let pointY = y * stepH - gridY * squareH;
        let tl = grid[gridY][gridX].x * pointX + grid[gridY][gridX].y * pointY;

        // Координаты точки относительноTopRight
        pointX = x * stepW - (gridX + 1) * squareW;
        let tr = grid[gridY][gridX + 1].x * pointX + grid[gridY][gridX + 1].y * pointY;

        // Считаем интерполяцию
        pointX = (x * stepW - gridX * squareW) / squareW;
        let top = tl + (3 * pointX * pointX - 2 * pointX * pointX * pointX) * (tr - tl)

        // Относительно BottomLeft
        pointY = y * stepH - (gridY + 1) * squareH;
        let bl = grid[gridY + 1][gridX].x * pointX + grid[gridY + 1][gridX].y * pointY;

        // Относительно BottomRight
        pointX = x * stepW - (gridX + 1) * squareW;
        let br = grid[gridY + 1][gridX + 1].x * pointX + grid[gridY + 1][gridX + 1].y * pointY;


        pointX = (x * stepW - gridX * squareW) / squareW;
        let bottom = bl + (3 * pointX * pointX - 2 * pointX * pointX * pointX) * (br - bl);

        pointY = (y * stepH - gridY * squareH) / squareH;
        let result = top + (3 * pointY * pointY - 2 * pointY * pointY * pointY) * (bottom - top)
        noiseRow.push(result * elev);
      }
      noise.push(noiseRow);
    }

    return { noise, stepW, stepH }
  }

  let { noise, stepW, stepH } = makeNoise(grid, meshSizeW, meshSizeH, elevation, smoothness);

  let rows = noise.length;
  let colums = noise[0].length;

  let vertices = [];
  for (let row = 0; row < rows - 1; row++) {
    for (let column = 0; column < colums - 1; column++) {
      // Верхняя левая
      vertices.push(row * stepH - meshSizeH / 2);
      vertices.push(noise[row][column]);
      vertices.push(column * stepW - meshSizeW / 2);
      // Верхняя правая
      vertices.push(row * stepH - meshSizeH / 2);
      vertices.push(noise[row][column + 1]);
      vertices.push((column + 1) * stepW - meshSizeW / 2);
      // Нижняя
      vertices.push((row + 1) * stepH - meshSizeH / 2);
      vertices.push(noise[row + 1][column]);
      vertices.push(column * stepW - meshSizeW / 2);

      // Верхняя
      vertices.push(row * stepH - meshSizeH / 2);
      vertices.push(noise[row][column + 1]);
      vertices.push((column + 1) * stepW - meshSizeH / 2);
      // Нижняя правая
      vertices.push((row + 1) * stepH - meshSizeH / 2);
      vertices.push(noise[row + 1][column + 1]);
      vertices.push((column + 1) * stepW - meshSizeW / 2);
      // Нижняя левая
      vertices.push((row + 1) * stepH - meshSizeH / 2);
      vertices.push(noise[row + 1][column]);
      vertices.push(column * stepW - meshSizeW / 2);
    }
  }
  vertices = new Float32Array(vertices);
  return (
    <mesh ref={mapRef} castShadow receiveShadow>
      <bufferGeometry receiveShadow castShadow>
        <bufferAttribute
          attachObject={["attributes", "position"]}
          array={vertices}
          itemSize={3}
          count={vertices.length}
          receiveShadow
          castShadow
          needsUpdate={true}
        />
      </bufferGeometry>
      <meshBasicMaterial attach='material' color="#3f9b0b" side={DoubleSide} receiveShadow castShadow />
    </mesh>
  )
}


function App() {

  return (
    <div className="App" style={{ overflow: 'hidden' }}>
      <Canvas
        style={{ width: '100%', height: document.body.clientHeight, border: '1px solid black' }}
        colorManagement
        shadowMap
        camera={{ position: [80, 90, 70], rotation: [-Math.PI / 6, 0, 0], fov: 80 }}
      >
        {/* Туман и освещение */}
        {/* <fog attach="fog" args={["white", 1, 350]} /> */}
        <ambientLight intensity={0.1} />
        <directionalLight
          intensity={0.5}
          castShadow
          shadow-mapSize-height={512}
          shadow-mapSize-width={512}
        />

        {/* Поверхность */}
        <Map />
        {/* Поверхность воды */}
        <Plane
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -1, 0]}
          args={[2000, 2000]}
        >
          <meshStandardMaterial attach="material" color="#00ffff" />
        </Plane>
        {/* Камера */}
        <PerspectiveCamera />
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
        <Background />
      </Canvas>
      <header className="App-header">
        <p>
          Динамический скринсейвер "Природный ландшафт" на основе шума перлина
        </p>
      </header>
    </div>
  );
}

export default App;
