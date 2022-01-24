import './App.css';

import React, { useEffect,  useRef } from 'react';
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Box, Plane, } from "@react-three/drei";
import { DoubleSide } from "three";

const Scene = () => {
  const boxRef = useRef();
  useFrame(() => {
    boxRef.current.rotation.y += 0.004;
    boxRef.current.rotation.x += 0.004;
    boxRef.current.rotation.z += 0.004;
  });
  // Set receiveShadow on any mesh that should be in shadow,
  // and castShadow on any mesh that should create a shadow.
  return (
    <group>
      <Box castShadow receiveShadow ref={boxRef} position={[0, 0.5, 0]}>
        <meshStandardMaterial attach="material" color="white" />
      </Box>
      <Plane
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1, 0]}
        args={[1000, 1000]}
      >
        <meshStandardMaterial attach="material" color="white" />
      </Plane>
    </group>
  );
};

const Background = () => {
  const { gl, scene } = useThree();
  gl.setClearColor(0x87ceeb, 1);
  // const loader = new CubeTextureLoader();
  // const texture = loader.load([
  //   '/1.jpg',
  //   '/2.jpg',
  //   '/3.jpg',
  //   '/4.jpg',
  //   '/5.jpg',
  //   '/6.jpg',
  // ]);
  // scene.background = texture;
  return null
}

function App() {
  const geoTarget = useRef();
  useEffect(() => {
    if (!geoTarget.current) {
      return;
    }
    // debugger
    // let box = geoTarget.current.computeBouningBox();
    // debugger
  })



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

  let grid = makeGrid(6, 6);

  const makeNoise = (gradientGrid, targetW, targetH, elev, smoothCoeff) => {
    let gridH = gradientGrid.length;
    let squareH = targetH / (gridH - 1);    // Т.к. 2 ряда сетки образуют один квадрат
    let stepH = squareH / smoothCoeff;

    let gridW = gradientGrid[0].length;
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

  let meshSizeW = 160;
  let meshSizeH = 160;
  let elevation = 1.5;
  let smmoothness = 6;

  let { noise, stepW, stepH } = makeNoise(grid, meshSizeW, meshSizeH, elevation, smmoothness);

  let rows = noise.length;
  let colums = noise[0].length;

  let vertices = [];
  for (let row = 0; row < rows - 1; row++) {
    for (let column = 0; column < colums - 1; column++) {
      // Верхняя левая
      vertices.push(row * stepH);
      vertices.push(noise[row][column]);
      vertices.push(column * stepW);
      // Верхняя правая
      vertices.push(row * stepH);
      vertices.push(noise[row][column + 1]);
      vertices.push((column + 1) * stepW);
      // Нижняя
      vertices.push((row + 1) * stepH);
      vertices.push(noise[row + 1][column]);
      vertices.push(column * stepW);

      // Верхняя
      vertices.push(row * stepH);
      vertices.push(noise[row][column + 1]);
      vertices.push((column + 1) * stepW);
      // Нижняя правая
      vertices.push((row + 1) * stepH);
      vertices.push(noise[row + 1][column + 1]);
      vertices.push((column + 1) * stepW);
      // Нижняя левая
      vertices.push((row + 1) * stepH);
      vertices.push(noise[row + 1][column]);
      vertices.push(column * stepW);
    }
  }

  vertices = new Float32Array(vertices);

  return (
    <div className="App">
      <Canvas
        style={{ width: '100%', height: document.body.clientHeight, border: '1px solid black' }}
        colorManagement
        shadowMap
        camera={{ position: [40, 40, 80], rotation: [-Math.PI / 5, 0, 0], fov: 90 }}
      >
        <fog attach="fog" args={["white", 1, 200]} />
        <ambientLight intensity={0.1} />

        <directionalLight
          intensity={0.5}
          castShadow
          shadow-mapSize-height={512}
          shadow-mapSize-width={512}
        />

        {/* Поверхность */}
        <mesh position={[-meshSizeW / 2, 0, -meshSizeH / 2]} castShadow receiveShadow>
          <bufferGeometry ref={geoTarget} receiveShadow castShadow>
            <bufferAttribute
              attachObject={["attributes", "position"]}
              array={vertices}
              itemSize={3}
              count={vertices.length}
              receiveShadow
              castShadow
            />
          </bufferGeometry>
          <meshBasicMaterial attach='material' color="#3f9b0b" side={DoubleSide} receiveShadow castShadow />
        </mesh>
        {/* Сетка */}
        <gridHelper scale={10} />
        {/* Поверхность воды */}
          <Plane
            receiveShadow
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -1, 0]}
            args={[1000, 1000]}
          >
            <meshStandardMaterial attach="material" color="#00ffff" />
          </Plane>
        

        <PerspectiveCamera/>
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
        <Background />
      </Canvas>

      <form >
        <label>
          Коэффициент сглаживания:
          <input type='number' name='smoothness' min={1} />
        </label>
        <input type='submit' value="Применить" onClick={() => alert('clicked')} />
      </form>
      <header className="App-header">
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
      </header>
    </div>
  );
}

export default App;
