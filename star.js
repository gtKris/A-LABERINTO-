
    const gridElement = document.getElementById("grid");
    const grid = [];
    const numRows = 10;
    const numCols = 10;
    let startCell = null;
    let endCell = null;

    // Creacion del tablero
    for (let row = 0; row < numRows; row++) {
      const rowArray = [];
      for (let col = 0; col < numCols; col++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.addEventListener("click", () => toggleWall(cell));
        cell.addEventListener("contextmenu", (e) => setStartOrEnd(e, cell));
        gridElement.appendChild(cell);
        rowArray.push(cell);
      }
      grid.push(rowArray);
    }

    
    function toggleWall(cell) {
      if (cell === startCell || cell === endCell) return;
      cell.classList.toggle("wall");
    }

    document.addEventListener("keydown", (e) => {
      if (!startCell && e.key === "s") {
        startCell = document.querySelector(".cell:hover");
        if (startCell) {
          startCell.classList.add("start");
        }
      } else if (!endCell && e.key === "f") {
        endCell = document.querySelector(".cell:hover");
        if (endCell) {
          endCell.classList.add("end");
        }
      }
    });

  
    function findPath() {
      if (!startCell || !endCell) {
        Swal.fire({
          title: "Advertencia",
          text: "Por favor, indique la celda de inicio (tecla s) y la celda de destino (tecla f)",
          icon: "warning",
        });
        return;
      }
    
      const path = astar();
      if (path) {
        const numberOfCells = path.length;
        animatePath(path);
      } else {
        Swal.fire({
          title: "Error",
          text: "No se encontró el camino",
          icon: "error",
        });
      }
    }
    

    // Animacion de la solucion 
    function animatePath(path) {
      let i = 0;
      const interval = setInterval(() => {
        if (i < path.length) {
          const cell = path[i];
          if (cell !== startCell && cell !== endCell) {
            cell.classList.add("path");
          }
          i++;
        } else {
          clearInterval(interval);
          const numberOfCells = path.length;
          setTimeout(() => {
            Swal.fire({
              title: "Completado",
              text: `Se han pasado por ${numberOfCells} celdas para llegar al destino.`,
              icon: "success",
            });
          }, 700); 
        }
      }, 400);
    }
    

    // A* algoritmo
    function astar() {
      const openList = [];
      const closedList = [];

      openList.push(startCell);

      while (openList.length > 0) {
        let currentCell = openList[0];
        for (let cell of openList) {
          if (cell.f < currentCell.f) {
            currentCell = cell;
          }
        }

        openList.splice(openList.indexOf(currentCell), 1);
        closedList.push(currentCell);

        if (currentCell === endCell) {
          return reconstructPath(currentCell);
        }

        const neighbors = getNeighbors(currentCell);

        for (let neighbor of neighbors) {
          if (closedList.includes(neighbor) || neighbor.classList.contains("wall")) {
            continue;
          }

          const tentativeG = currentCell.g + 1;

          if (!openList.includes(neighbor) || tentativeG < neighbor.g) {
            neighbor.g = tentativeG;
            neighbor.h = heuristic(neighbor, endCell);
            neighbor.f = neighbor.g + neighbor.h;
            neighbor.parent = currentCell;

            if (!openList.includes(neighbor)) {
              openList.push(neighbor);
            }
          }
        }
      }

      return null;
    }

    // Funcion heuristica
    function heuristic(cell, endCell) {
      return Math.abs(cell.dataset.row - endCell.dataset.row) + Math.abs(cell.dataset.col - endCell.dataset.col);
    }

    // Vecinos del tablero 
    function getNeighbors(cell) {
      const neighbors = [];
      const row = parseInt(cell.dataset.row);
      const col = parseInt(cell.dataset.col);

      if (row > 0) neighbors.push(grid[row - 1][col]);
      if (row < numRows - 1) neighbors.push(grid[row + 1][col]);
      if (col > 0) neighbors.push(grid[row][col - 1]);
      if (col < numCols - 1) neighbors.push(grid[row][col + 1]);

      return neighbors;
    }

    function reconstructPath(currentCell) {
      const path = [];
      while (currentCell) {
        path.unshift(currentCell);
        currentCell = currentCell.parent;
      }
      return path;
    }
