'use client'
import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'

// Componente que usa useSearchParams
function InfoPageContent() {
  const searchParams = useSearchParams()
  const [seq1, setSeq1] = useState("")
  const [seq2, setSeq2] = useState("")
  const [matchScore, setMatchScore] = useState(1)
  const [gapPenalty, setGapPenalty] = useState(-1)
  const [mismatchPenalty, setMismatchPenalty] = useState(-1)
  const [scoreMatrix, setScoreMatrix] = useState<number[][]>([])
  const [tracebackMatrix, setTracebackMatrix] = useState<string[][]>([])
  const [alignedSeq1, setAlignedSeq1] = useState<string[]>([])
  const [alignedSeq2, setAlignedSeq2] = useState<string[]>([])
  const [alignmentScore, setAlignmentScore] = useState(0)
  const [statistics, setStatistics] = useState({
    matches: 0,
    mismatches: 0,
    gaps: 0,
    identity: 0,
    length: 0
  })
  const [copySuccess, setCopySuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [progressStatus, setProgressStatus] = useState("Initializing...")
  const [matrixViewMode, setMatrixViewMode] = useState<'standard' | 'heatmap' | 'arrows' | 'colorful' | 'gradient' | 'highlight'>('standard')
  const [showDifferenceHighlight, setShowDifferenceHighlight] = useState(false)
  const [alignmentViewMode, setAlignmentViewMode] = useState<'blocks' | 'linear' | 'detailed' | 'compact' | 'interactive' | 'comparative'>('blocks')
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [hoverIntentTimeout, setHoverIntentTimeout] = useState<NodeJS.Timeout | null>(null)
  const [selectedCell, setSelectedCell] = useState<{i: number, j: number} | null>(null)
  const [highlightMode, setHighlightMode] = useState<'selected' | 'path' | 'maximum' | 'minimum' | 'custom' | 'diagonal' | 'above' | 'below' | 'pattern'>('selected')
  const [highlightAlignmentIndices, setHighlightAlignmentIndices] = useState<number[]>([])
  const [thresholdValue, setThresholdValue] = useState<number>(0)
  const [patternType, setPatternType] = useState<'matches' | 'mismatches' | 'gaps' | 'positive' | 'negative'>('matches')
  const [isMatrixCollapsed, setIsMatrixCollapsed] = useState(false)
  const [collapsedRange, setCollapsedRange] = useState<{start: number, end: number, size: number}>({start: 0, end: 0, size: 10})
  const [showRangeSelector, setShowRangeSelector] = useState(false)
  const [renderingChunks, setRenderingChunks] = useState(true)
  const [chunkSize, setChunkSize] = useState(50)
  const [renderedChunks, setRenderedChunks] = useState<number[]>([0])
  const [isChunkLoading, setIsChunkLoading] = useState(false)
  // Novo estado para controlar o zoom no Similarity Profile e Alignment Regions
  const [zoomRange, setZoomRange] = useState<{start: number, end: number} | null>(null)

  useEffect(() => {
    // Retrieve parameters from URL
    const seq1Param = searchParams.get('seq1') || ""
    const seq2Param = searchParams.get('seq2') || ""
    const matchScoreParam = Number(searchParams.get('match')) || 1
    const gapPenaltyParam = Number(searchParams.get('gap')) || -1
    const mismatchPenaltyParam = Number(searchParams.get('mismatch')) || -1

    setSeq1(seq1Param)
    setSeq2(seq2Param)
    setMatchScore(matchScoreParam)
    setGapPenalty(gapPenaltyParam)
    setMismatchPenalty(mismatchPenaltyParam)

    // Save parameters to localStorage when the page loads
    if (typeof window !== 'undefined' && seq1Param && seq2Param) {
      localStorage.setItem('nw_seq1', seq1Param)
      localStorage.setItem('nw_seq2', seq2Param)
      localStorage.setItem('nw_matchScore', matchScoreParam.toString())
      localStorage.setItem('nw_gapPenalty', gapPenaltyParam.toString())
      localStorage.setItem('nw_mismatchPenalty', mismatchPenaltyParam.toString())
    }

    if (seq1Param && seq2Param) {
      setIsLoading(true)
      setProgressStatus("Initializing calculations...")
      
      // Use setTimeout to avoid blocking the interface
      setTimeout(() => {
        try {
          setProgressStatus("Calculating score matrix...")
          const result = needlemanWunsch(seq1Param, seq2Param, matchScoreParam, gapPenaltyParam, mismatchPenaltyParam)
          
          setProgressStatus("Processing results...")
          setScoreMatrix(result.scoreMatrix)
          setTracebackMatrix(result.tracebackMatrix)
          setAlignedSeq1(result.alignedSeq1)
          setAlignedSeq2(result.alignedSeq2)
          setAlignmentScore(result.finalScore)

          setProgressStatus("Calculating statistics...")
          // Calculate statistics
          const stats = calculateStatistics(result.alignedSeq1, result.alignedSeq2)
          setStatistics(stats)
          
          setProgressStatus("Completed!")
          setIsLoading(false)
        } catch (error) {
          console.error("Error processing alignment:", error)
          setProgressStatus("Error processing. Try shorter sequences.")
          setIsLoading(false)
        }
      }, 100) // Small delay to allow rendering of initial state
    } else {
      setIsLoading(false)
    }
  }, [searchParams])

  useEffect(() => {
    // Função para renderizar chunks iniciais
    if (scoreMatrix.length > 0) {
      const totalChunks = Math.ceil(scoreMatrix.length / chunkSize);
      // Inicialmente, renderizar apenas o primeiro chunk
      setRenderedChunks([0]);
      setRenderingChunks(totalChunks > 1);
    }
  }, [scoreMatrix, chunkSize]);

  // Função para carregar o próximo chunk
  const loadNextChunk = () => {
    if (renderedChunks.length * chunkSize >= scoreMatrix.length) {
      // Todos os chunks já foram renderizados
      return;
    }
    
    setIsChunkLoading(true);
    
    // Usar setTimeout para não bloquear a UI
    setTimeout(() => {
      const nextChunkIndex = renderedChunks.length;
      setRenderedChunks([...renderedChunks, nextChunkIndex]);
      setIsChunkLoading(false);
    }, 50);
  };

  // Função para verificar se é necessário carregar mais chunks conforme o scroll
  const handleTableScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (!renderingChunks || isChunkLoading) return;
    
    const target = event.target as HTMLDivElement;
    const scrollBottom = target.scrollTop + target.clientHeight;
    const scrollThreshold = target.scrollHeight * 0.8; // Carregar próximo chunk quando chegar a 80% do scroll
    
    if (scrollBottom >= scrollThreshold) {
      loadNextChunk();
    }
  };

  // Função para determinar quais linhas devem ser renderizadas
  const shouldRenderRow = (rowIndex: number) => {
    if (!renderingChunks) return true;
    
    const chunkIndex = Math.floor(rowIndex / chunkSize);
    return renderedChunks.includes(chunkIndex);
  };

  // Adicionar opções para controlar o chunking
  const toggleChunking = () => {
    if (renderingChunks) {
      // Se estiver desativando, renderizar tudo de uma vez
      const totalChunks = Math.ceil(scoreMatrix.length / chunkSize);
      const allChunks = Array.from({ length: totalChunks }, (_, i) => i);
      setRenderedChunks(allChunks);
      setRenderingChunks(false);
    } else {
      // Se estiver ativando, voltar ao comportamento de chunks
      setRenderedChunks([0]);
      setRenderingChunks(true);
    }
  };

  // Function to copy current URL to clipboard
  const copyUrlToClipboard = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          setCopySuccess(true)
          setTimeout(() => setCopySuccess(false), 2000)
        })
        .catch(err => {
          console.error('Failed to copy URL: ', err)
        })
    }
  }

  // Implementation of the Needleman-Wunsch algorithm
  function needlemanWunsch(seq1: string, seq2: string, matchScore: number, gapPenalty: number, mismatchPenalty: number) {
    const m = seq1.length
    const n = seq2.length

    // Initialize the score matrix and traceback matrix
    const scoreMatrix = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
    const tracebackMatrix = Array.from({ length: m + 1 }, () => Array(n + 1).fill(" "))

    // Initialize the first column
    for (let i = 1; i <= m; ++i) {
      scoreMatrix[i][0] = scoreMatrix[i - 1][0] + gapPenalty
      tracebackMatrix[i][0] = "U"
    }
    
    // Initialize the first row
    for (let j = 1; j <= n; ++j) {
      scoreMatrix[0][j] = scoreMatrix[0][j - 1] + gapPenalty
      tracebackMatrix[0][j] = "L"
    }

    // Fill the matrix
    for (let i = 1; i <= m; ++i) {
      for (let j = 1; j <= n; ++j) {
        const match = scoreMatrix[i - 1][j - 1] + (seq1[i - 1] === seq2[j - 1] ? matchScore : mismatchPenalty)
        const gapUp = scoreMatrix[i - 1][j] + gapPenalty
        const gapLeft = scoreMatrix[i][j - 1] + gapPenalty

        scoreMatrix[i][j] = Math.max(match, gapUp, gapLeft)

        if (scoreMatrix[i][j] === match) {
          tracebackMatrix[i][j] = "D" // Diagonal
        } else if (scoreMatrix[i][j] === gapUp) {
          tracebackMatrix[i][j] = "U" // Up
        } else {
          tracebackMatrix[i][j] = "L" // Left
        }
      }
    }

    // Traceback the alignment
    let i = m, j = n
    const alignedSeq1: string[] = []
    const alignedSeq2: string[] = []

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && tracebackMatrix[i][j] === "D") {
        alignedSeq1.unshift(seq1[i - 1])
        alignedSeq2.unshift(seq2[j - 1])
        --i
        --j
      } else if (i > 0 && tracebackMatrix[i][j] === "U") {
        alignedSeq1.unshift(seq1[i - 1])
        alignedSeq2.unshift("-")
        --i
      } else if (j > 0) {
        alignedSeq1.unshift("-")
        alignedSeq2.unshift(seq2[j - 1])
        --j
      } else {
        break
      }
    }

    return { 
      alignedSeq1, 
      alignedSeq2, 
      finalScore: scoreMatrix[m][n],
      scoreMatrix,
      tracebackMatrix
    }
  }

  // Calculate alignment statistics
  function calculateStatistics(seq1: string[], seq2: string[]) {
    let matches = 0
    let mismatches = 0
    let gaps = 0
    
    for (let i = 0; i < seq1.length; i++) {
      if (seq1[i] === '-' || seq2[i] === '-') {
        gaps++
      } else if (seq1[i] === seq2[i]) {
        matches++
      } else {
        mismatches++
      }
    }

    const length = seq1.length
    const identity = matches > 0 ? (matches / length) * 100 : 0

    return {
      matches,
      mismatches,
      gaps,
      identity: parseFloat(identity.toFixed(2)),
      length
    }
  }

  // Função para lidar com o hover com delay para evitar glitches
  const handleHoverEnter = (index: number) => {
    // Cancelar qualquer timeout anterior
    if (hoverIntentTimeout) {
      clearTimeout(hoverIntentTimeout);
    }
    
    // Definir novo timeout para atualizar o índice hover
    const timeout = setTimeout(() => {
      setHoveredIndex(index);
    }, 50); // pequeno delay para evitar flickering
    
    setHoverIntentTimeout(timeout);
  };
  
  const handleHoverLeave = () => {
    // Cancelar qualquer timeout anterior
    if (hoverIntentTimeout) {
      clearTimeout(hoverIntentTimeout);
    }
    
    // Definir novo timeout para limpar o hover
    const timeout = setTimeout(() => {
      setHoveredIndex(null);
    }, 50);
    
    setHoverIntentTimeout(timeout);
  };
  
  // Limpar timeout ao desmontar
  useEffect(() => {
    return () => {
      if (hoverIntentTimeout) {
        clearTimeout(hoverIntentTimeout);
      }
    };
  }, [hoverIntentTimeout]);

  // Função para lidar com o clique na célula
  const handleCellClick = (i: number, j: number) => {
    setSelectedCell({i, j});
    
    // Calcular os índices do alinhamento correspondentes a esta célula
    if (i > 0 && j > 0) {
      calculateAlignmentIndicesFromCell(i, j);
    } else {
      setHighlightAlignmentIndices([]);
    }
  };

  // Função para calcular os índices do alinhamento que correspondem a uma célula da matriz
  const calculateAlignmentIndicesFromCell = (i: number, j: number) => {
    // Reconstruir o caminho de traceback da célula até a origem
    let currentI = i;
    let currentJ = j;
    const path: {i: number, j: number}[] = [{i: currentI, j: currentJ}];
    
    // Seguir o caminho de traceback até alcançar a origem
    while (currentI > 0 || currentJ > 0) {
      const direction = tracebackMatrix[currentI][currentJ];
      
      if (direction === 'D' && currentI > 0 && currentJ > 0) {
        currentI--;
        currentJ--;
      } else if (direction === 'U' && currentI > 0) {
        currentI--;
      } else if (direction === 'L' && currentJ > 0) {
        currentJ--;
      } else {
        break;
      }
      
      path.push({i: currentI, j: currentJ});
    }
    
    // Mapear o caminho para os índices correspondentes no alinhamento
    // Começamos do fim do alinhamento e recuamos
    let alignmentIndex = alignedSeq1.length - 1;
    let matrixI = scoreMatrix.length - 1;
    let matrixJ = scoreMatrix[0].length - 1;
    const indices: number[] = [];
    
    // Mapeia a posição final da matriz (canto inferior direito) para o fim do alinhamento
    if (matrixI === i && matrixJ === j) {
      indices.push(alignmentIndex);
    }
    
    // Traceback completo do alinhamento para encontrar correspondências
    while (matrixI > 0 || matrixJ > 0) {
      const direction = tracebackMatrix[matrixI][matrixJ];
      
      // Verificar se esta célula da matriz está no caminho que estamos procurando
      if (path.some(cell => cell.i === matrixI && cell.j === matrixJ)) {
        indices.push(alignmentIndex);
      }
      
      // Mover para a próxima posição conforme o traceback
      if (direction === 'D' && matrixI > 0 && matrixJ > 0) {
        matrixI--;
        matrixJ--;
        alignmentIndex--;
      } else if (direction === 'U' && matrixI > 0) {
        matrixI--;
        alignmentIndex--;
      } else if (direction === 'L' && matrixJ > 0) {
        matrixJ--;
        alignmentIndex--;
      } else {
        break;
      }
    }
    
    setHighlightAlignmentIndices(indices);
  };

  // Render matrix with colored values
  const renderMatrix = () => {
    if (!seq1 || !seq2 || scoreMatrix.length === 0) return null

    // Cálculo do valor mínimo e máximo para o heatmap
    let minValue = Infinity;
    let maxValue = -Infinity;
    let maxPositions: {i: number, j: number}[] = [];
    let minPositions: {i: number, j: number}[] = [];
    
    if (matrixViewMode === 'heatmap' || matrixViewMode === 'colorful' || matrixViewMode === 'gradient' || matrixViewMode === 'highlight') {
      scoreMatrix.forEach((row, i) => {
        row.forEach((score, j) => {
          if (score < minValue) {
            minValue = score;
            minPositions = [{i, j}];
          } else if (score === minValue) {
            minPositions.push({i, j});
          }
          
          if (score > maxValue) {
            maxValue = score;
            maxPositions = [{i, j}];
          } else if (score === maxValue) {
            maxPositions.push({i, j});
          }
        });
      });
    }

    // Função para gerar cor do heatmap baseado no valor
    const getHeatMapColor = (value: number) => {
      // Normaliza o valor entre 0 e 1
      const normalized = (value - minValue) / (maxValue - minValue || 1);
      
      // Esquema de cor de azul para vermelho
      const r = Math.floor(normalized * 255);
      const b = Math.floor((1 - normalized) * 255);
      
      return `rgb(${r}, 0, ${b})`;
    };
    
    // Função para gerar cores vibrantes para o modo colorful
    const getColorfulColor = (value: number) => {
      // Normaliza o valor entre 0 e 1
      const normalized = (value - minValue) / (maxValue - minValue || 1);
      
      // Criar um esquema de cores do arco-íris
      const hue = normalized * 270; // 0 a 270 graus do círculo de cores (azul a vermelho)
      return `hsl(${hue}, 100%, 50%)`;
    };
    
    // Função para gerar gradiente para o modo gradiente
    const getGradientColor = (value: number) => {
      // Normaliza o valor entre 0 e 1
      const normalized = (value - minValue) / (maxValue - minValue || 1);
      
      // Verde para valores positivos, vermelho para negativos, tom baseado na magnitude
      if (value > 0) {
        // Verde com intensidade baseada no valor
        const intensity = 128 + Math.floor(normalized * 127);
        return `rgb(0, ${intensity}, 0)`;
      } else if (value < 0) {
        // Vermelho com intensidade baseada no valor (absoluto)
        const intensity = 128 + Math.floor(normalized * 127);
        return `rgb(${intensity}, 0, 0)`;
      } else {
        // Cinza para zero
        return 'rgb(90, 90, 90)';
      }
    };
    
    // Função para verificar se uma célula está em uma trajetória de alinhamento
    const isCellInPath = (i: number, j: number): boolean => {
      if (!selectedCell) return false;
      
      // Iniciar da célula selecionada e seguir o caminho de traceback
      let currentI = selectedCell.i;
      let currentJ = selectedCell.j;
      const path: {i: number, j: number}[] = [{i: currentI, j: currentJ}];
      
      // Seguir o caminho de traceback até alcançar a origem ou a borda
      while (currentI > 0 || currentJ > 0) {
        const direction = tracebackMatrix[currentI][currentJ];
        
        if (direction === 'D' && currentI > 0 && currentJ > 0) {
          currentI--;
          currentJ--;
        } else if (direction === 'U' && currentI > 0) {
          currentI--;
        } else if (direction === 'L' && currentJ > 0) {
          currentJ--;
        } else {
          break; // Em caso de problema com o traceback
        }
        
        path.push({i: currentI, j: currentJ});
      }
      
      return path.some(cell => cell.i === i && cell.j === j);
    };
    
    // Função para identificar se uma célula deve ser destacada
    const shouldHighlightCell = (i: number, j: number): boolean => {
      if (matrixViewMode !== 'highlight') return false;
      
      if (highlightMode === 'selected' && selectedCell && i === selectedCell.i && j === selectedCell.j) {
        return true;
      }
      
      if (highlightMode === 'path' && isCellInPath(i, j)) {
        return true;
      }
      
      if (highlightMode === 'maximum') {
        return maxPositions.some(pos => pos.i === i && pos.j === j);
      }
      
      if (highlightMode === 'minimum') {
        return minPositions.some(pos => pos.i === i && pos.j === j);
      }
      
      if (highlightMode === 'custom' && scoreMatrix[i][j] === (selectedCell ? scoreMatrix[selectedCell.i][selectedCell.j] : null)) {
        return true;
      }
      
      if (highlightMode === 'diagonal' && i === j) {
        return true;
      }
      
      if (highlightMode === 'above' && scoreMatrix[i][j] > thresholdValue) {
        return true;
      }
      
      if (highlightMode === 'below' && scoreMatrix[i][j] < thresholdValue) {
        return true;
      }
      
      if (highlightMode === 'pattern') {
        // Verificar padrões específicos
        if (i === 0 || j === 0) return false; // Ignorar bordas
        
        if (patternType === 'matches' && i > 0 && j > 0 && seq1[i-1] === seq2[j-1]) {
          return true;
        }
        
        if (patternType === 'mismatches' && i > 0 && j > 0 && seq1[i-1] !== seq2[j-1] && seq1[i-1] !== '-' && seq2[j-1] !== '-') {
          return true;
        }
        
        if (patternType === 'gaps') {
          // Verificar se esta célula corresponde a um gap (movimentos verticais ou horizontais)
          const direction = tracebackMatrix[i][j];
          return direction === 'U' || direction === 'L';
        }
        
        if (patternType === 'positive' && scoreMatrix[i][j] > 0) {
          return true;
        }
        
        if (patternType === 'negative' && scoreMatrix[i][j] < 0) {
          return true;
        }
      }
      
      return false;
    };

    return (
      <div className="overflow-x-auto mt-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <button 
            onClick={() => setMatrixViewMode('standard')}
            className={`px-3 py-1 text-sm rounded ${matrixViewMode === 'standard' ? 'bg-cyan-600' : 'bg-gray-700'}`}
          >
            Standard
          </button>
          <button 
            onClick={() => setMatrixViewMode('heatmap')}
            className={`px-3 py-1 text-sm rounded ${matrixViewMode === 'heatmap' ? 'bg-cyan-600' : 'bg-gray-700'}`}
          >
            Heatmap
          </button>
          <button 
            onClick={() => setMatrixViewMode('arrows')}
            className={`px-3 py-1 text-sm rounded ${matrixViewMode === 'arrows' ? 'bg-cyan-600' : 'bg-gray-700'}`}
          >
            Traceback Arrows
          </button>
          <button 
            onClick={() => setMatrixViewMode('colorful')}
            className={`px-3 py-1 text-sm rounded ${matrixViewMode === 'colorful' ? 'bg-cyan-600' : 'bg-gray-700'}`}
          >
            Colorful
          </button>
          <button 
            onClick={() => setMatrixViewMode('gradient')}
            className={`px-3 py-1 text-sm rounded ${matrixViewMode === 'gradient' ? 'bg-cyan-600' : 'bg-gray-700'}`}
          >
            Gradient
          </button>
          <button 
            onClick={() => setMatrixViewMode('highlight')}
            className={`px-3 py-1 text-sm rounded ${matrixViewMode === 'highlight' ? 'bg-cyan-600' : 'bg-gray-700'}`}
          >
            Highlight
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={showDifferenceHighlight} 
                onChange={() => setShowDifferenceHighlight(!showDifferenceHighlight)}
                className="rounded text-cyan-600 focus:ring-cyan-500"
              />
              <span className="text-sm">Highlight Differences</span>
            </label>
          </div>
        </div>
        
        {matrixViewMode === 'highlight' && (
          <div className="flex flex-wrap gap-4 mb-4 bg-gray-800 p-3 rounded-lg">
            <button 
              onClick={() => setHighlightMode('selected')}
              className={`px-3 py-1 text-xs rounded ${highlightMode === 'selected' ? 'bg-cyan-600' : 'bg-gray-700'}`}
            >
              Selected Cell
            </button>
            <button 
              onClick={() => setHighlightMode('path')}
              className={`px-3 py-1 text-xs rounded ${highlightMode === 'path' ? 'bg-cyan-600' : 'bg-gray-700'}`}
            >
              Traceback Path
            </button>
            <button 
              onClick={() => setHighlightMode('maximum')}
              className={`px-3 py-1 text-xs rounded ${highlightMode === 'maximum' ? 'bg-cyan-600' : 'bg-gray-700'}`}
            >
              Maximum Values ({maxValue})
            </button>
            <button 
              onClick={() => setHighlightMode('minimum')}
              className={`px-3 py-1 text-xs rounded ${highlightMode === 'minimum' ? 'bg-cyan-600' : 'bg-gray-700'}`}
            >
              Minimum Values ({minValue})
            </button>
            <button 
              onClick={() => setHighlightMode('custom')}
              className={`px-3 py-1 text-xs rounded ${highlightMode === 'custom' ? 'bg-cyan-600' : 'bg-gray-700'}`}
            >
              Same Values
            </button>
            <button 
              onClick={() => setHighlightMode('diagonal')}
              className={`px-3 py-1 text-xs rounded ${highlightMode === 'diagonal' ? 'bg-cyan-600' : 'bg-gray-700'}`}
            >
              Diagonal
            </button>
            <button 
              onClick={() => setHighlightMode('above')}
              className={`px-3 py-1 text-xs rounded ${highlightMode === 'above' ? 'bg-cyan-600' : 'bg-gray-700'}`}
            >
              Above Threshold
            </button>
            <button 
              onClick={() => setHighlightMode('below')}
              className={`px-3 py-1 text-xs rounded ${highlightMode === 'below' ? 'bg-cyan-600' : 'bg-gray-700'}`}
            >
              Below Threshold
            </button>
            <button 
              onClick={() => setHighlightMode('pattern')}
              className={`px-3 py-1 text-xs rounded ${highlightMode === 'pattern' ? 'bg-cyan-600' : 'bg-gray-700'}`}
            >
              Patterns
            </button>
            
            {/* Controles adicionais que aparecem dependendo do modo selecionado */}
            {(highlightMode === 'above' || highlightMode === 'below') && (
              <div className="flex items-center gap-2 w-full mt-2">
                <span className="text-xs">Threshold:</span>
                <input 
                  type="range" 
                  min={minValue} 
                  max={maxValue} 
                  value={thresholdValue}
                  onChange={(e) => setThresholdValue(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs w-10 text-right">{thresholdValue}</span>
              </div>
            )}
            
            {highlightMode === 'pattern' && (
              <div className="flex flex-wrap gap-2 w-full mt-2">
                <button
                  onClick={() => setPatternType('matches')}
                  className={`px-2 py-0.5 text-xs rounded ${patternType === 'matches' ? 'bg-green-600' : 'bg-gray-700'}`}
                >
                  Matches
                </button>
                <button
                  onClick={() => setPatternType('mismatches')}
                  className={`px-2 py-0.5 text-xs rounded ${patternType === 'mismatches' ? 'bg-yellow-600' : 'bg-gray-700'}`}
                >
                  Mismatches
                </button>
                <button
                  onClick={() => setPatternType('gaps')}
                  className={`px-2 py-0.5 text-xs rounded ${patternType === 'gaps' ? 'bg-red-600' : 'bg-gray-700'}`}
                >
                  Gaps
                </button>
                <button
                  onClick={() => setPatternType('positive')}
                  className={`px-2 py-0.5 text-xs rounded ${patternType === 'positive' ? 'bg-emerald-600' : 'bg-gray-700'}`}
                >
                  Positive Values
                </button>
                <button
                  onClick={() => setPatternType('negative')}
                  className={`px-2 py-0.5 text-xs rounded ${patternType === 'negative' ? 'bg-rose-600' : 'bg-gray-700'}`}
                >
                  Negative Values
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Controles de visualização da tabela */}
        <div className="flex justify-between items-center mb-2 bg-gray-800 p-2 rounded">
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (isMatrixCollapsed) {
                  setIsMatrixCollapsed(false);
                  setShowRangeSelector(false);
                } else {
                  // Configurar o intervalo padrão quando colapsar pela primeira vez
                  if (scoreMatrix.length > 10) {
                    const midPoint = Math.floor(scoreMatrix.length / 2);
                    const halfSize = Math.min(5, Math.floor(scoreMatrix.length / 4));
                    setCollapsedRange({
                      start: Math.max(0, midPoint - halfSize),
                      end: Math.min(scoreMatrix.length - 1, midPoint + halfSize),
                      size: halfSize * 2 + 1
                    });
                  } else {
                    setCollapsedRange({
                      start: 0,
                      end: scoreMatrix.length - 1,
                      size: scoreMatrix.length
                    });
                  }
                  setIsMatrixCollapsed(true);
                }
              }}
              className="px-3 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600 flex items-center gap-1"
            >
              <span>{isMatrixCollapsed ? "Expand Matrix" : "Collapse Matrix"}</span>
              <span>{isMatrixCollapsed ? "↔" : "↕"}</span>
            </button>
            
            {isMatrixCollapsed && (
              <button
                onClick={() => setShowRangeSelector(!showRangeSelector)}
                className="px-3 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600"
              >
                Configure Range
              </button>
            )}
            
            {/* Botão para controlar a renderização em chunks */}
            {scoreMatrix.length > chunkSize && (
              <button
                onClick={toggleChunking}
                className={`px-3 py-1 text-xs rounded ${renderingChunks ? 'bg-cyan-600' : 'bg-gray-700'} hover:bg-gray-600 flex items-center gap-1`}
                title={renderingChunks ? "Carregando em partes para evitar travamentos" : "Carregar matriz inteira de uma vez"}
              >
                <span>{renderingChunks ? "Progressive Loading" : "Load All"}</span>
                {renderingChunks && <span className="text-xs">({renderedChunks.length * chunkSize}/{scoreMatrix.length})</span>}
              </button>
            )}
          </div>
          
          {isMatrixCollapsed && (
            <div className="text-xs text-gray-400">
              Showing {collapsedRange.size} rows/cols of {scoreMatrix.length} total
            </div>
          )}
        </div>
        
        {/* Seletor de intervalo */}
        {showRangeSelector && isMatrixCollapsed && (
          <div className="mb-4 bg-gray-800 p-3 rounded-lg">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-xs">Visible Range:</span>
                <div className="text-xs text-gray-400">
                  {collapsedRange.start}-{collapsedRange.end} (size: {collapsedRange.size})
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs">Start:</span>
                  <input
                    type="number"
                    min={0}
                    max={scoreMatrix.length - 1}
                    value={collapsedRange.start}
                    onChange={(e) => {
                      const newStart = Math.max(0, Math.min(Number(e.target.value), collapsedRange.end));
                      setCollapsedRange({
                        start: newStart,
                        end: collapsedRange.end,
                        size: collapsedRange.end - newStart + 1
                      });
                    }}
                    className="w-16 bg-gray-700 border border-gray-600 rounded p-1 text-xs"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs">End:</span>
                  <input
                    type="number"
                    min={collapsedRange.start}
                    max={scoreMatrix.length - 1}
                    value={collapsedRange.end}
                    onChange={(e) => {
                      const newEnd = Math.min(Number(e.target.value), scoreMatrix.length - 1);
                      setCollapsedRange({
                        start: collapsedRange.start,
                        end: newEnd,
                        size: newEnd - collapsedRange.start + 1
                      });
                    }}
                    className="w-16 bg-gray-700 border border-gray-600 rounded p-1 text-xs"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs">Size:</span>
                  <select
                    value={collapsedRange.size}
                    onChange={(e) => {
                      const newSize = Number(e.target.value);
                      const currentCenter = Math.floor((collapsedRange.start + collapsedRange.end) / 2);
                      const halfSize = Math.floor(newSize / 2);
                      
                      let newStart = Math.max(0, currentCenter - halfSize);
                      let newEnd = Math.min(scoreMatrix.length - 1, currentCenter + halfSize);
                      
                      // Ajustar para manter o tamanho solicitado, se possível
                      if (newEnd - newStart + 1 < newSize && newEnd < scoreMatrix.length - 1) {
                        newEnd = Math.min(scoreMatrix.length - 1, newStart + newSize - 1);
                      }
                      if (newEnd - newStart + 1 < newSize && newStart > 0) {
                        newStart = Math.max(0, newEnd - newSize + 1);
                      }
                      
                      setCollapsedRange({
                        start: newStart,
                        end: newEnd,
                        size: newEnd - newStart + 1
                      });
                    }}
                    className="w-20 bg-gray-700 border border-gray-600 rounded p-1 text-xs"
                  >
                    {[5, 10, 15, 20, 25, 30].map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // Mostrar início da matriz
                      const size = collapsedRange.size;
                      setCollapsedRange({
                        start: 0,
                        end: Math.min(size - 1, scoreMatrix.length - 1),
                        size
                      });
                    }}
                    className="px-2 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600"
                  >
                    Start
                  </button>
                  
                  <button
                    onClick={() => {
                      // Mostrar meio da matriz
                      const size = collapsedRange.size;
                      const midPoint = Math.floor(scoreMatrix.length / 2);
                      const halfSize = Math.floor(size / 2);
                      setCollapsedRange({
                        start: Math.max(0, midPoint - halfSize),
                        end: Math.min(scoreMatrix.length - 1, midPoint + halfSize),
                        size
                      });
                    }}
                    className="px-2 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600"
                  >
                    Middle
                  </button>
                  
                  <button
                    onClick={() => {
                      // Mostrar fim da matriz
                      const size = collapsedRange.size;
                      setCollapsedRange({
                        start: Math.max(0, scoreMatrix.length - size),
                        end: scoreMatrix.length - 1,
                        size
                      });
                    }}
                    className="px-2 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600"
                  >
                    End
                  </button>
                  
                  {selectedCell && (
                    <button
                      onClick={() => {
                        // Centralizar na célula selecionada
                        const size = collapsedRange.size;
                        const halfSize = Math.floor(size / 2);
                        const newStart = Math.max(0, selectedCell.i - halfSize);
                        const newEnd = Math.min(scoreMatrix.length - 1, newStart + size - 1);
                        setCollapsedRange({
                          start: newStart,
                          end: newEnd,
                          size
                        });
                      }}
                      className="px-2 py-1 text-xs rounded bg-cyan-600 hover:bg-cyan-700"
                    >
                      Show Selected
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto mt-6">
          {/* ... existing controls ... */}
          
          {/* Wrapper div com evento de scroll */}
          <div className="overflow-auto max-h-[70vh]" onScroll={handleTableScroll}>
            <table className="border-collapse text-center min-w-fit">
              <thead>
                <tr>
                  <th className="border border-gray-600 p-2 bg-gray-800 sticky top-0 z-10"></th>
                  <th className="border border-gray-600 p-2 bg-gray-800 sticky top-0 z-10"></th>
                  {seq2.split('').map((char, idx) => {
                    // No modo colapsado, só mostrar as colunas no intervalo definido
                    if (isMatrixCollapsed && (idx < collapsedRange.start || idx > collapsedRange.end)) {
                      return null;
                    }
                    return (
                      <th key={idx} className="border border-gray-600 p-2 bg-gray-800 w-10 h-10 sticky top-0 z-10">{char}</th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {scoreMatrix.map((row, i) => {
                  // No modo colapsado, só mostrar as linhas no intervalo definido
                  if (isMatrixCollapsed && (i < collapsedRange.start || i > collapsedRange.end)) {
                    return null;
                  }
                  
                  // Com renderização em chunks, só mostrar as linhas dos chunks já renderizados
                  if (!shouldRenderRow(i)) {
                    return null;
                  }
                  
                  return (
                    <tr key={i}>
                      <th className="border border-gray-600 p-2 bg-gray-800 sticky left-0 z-5">
                        {i === 0 ? '' : seq1[i-1]}
                      </th>
                      {row.map((score, j) => {
                        // No modo colapsado, só mostrar as colunas no intervalo definido
                        if (isMatrixCollapsed && (j < collapsedRange.start || j > collapsedRange.end)) {
                          return null;
                        }
                        
                        // Determinar a direção do traceback
                        const direction = tracebackMatrix[i][j];
                        
                        // Determinar a cor de fundo com base no modo de visualização
                        let bgColor = 'bg-gray-700';
                        let arrowSymbol = '';
                        let diffStyle: React.CSSProperties = {};
                        
                        if (matrixViewMode === 'standard') {
                          if (i > 0 && j > 0) {
                            if (direction === 'D') {
                              bgColor = seq1[i-1] === seq2[j-1] ? 'bg-green-700' : 'bg-yellow-700';
                            } else if (direction === 'U' || direction === 'L') {
                              bgColor = 'bg-red-700';
                            }
                          }
                        } else if (matrixViewMode === 'heatmap') {
                          // Usar o estilo inline para o heatmap
                          bgColor = '';
                          diffStyle = { backgroundColor: getHeatMapColor(score) };
                        } else if (matrixViewMode === 'colorful') {
                          // Usar o estilo inline para cores vibrantes
                          bgColor = '';
                          diffStyle = { backgroundColor: getColorfulColor(score) };
                        } else if (matrixViewMode === 'gradient') {
                          // Usar o estilo inline para o gradiente
                          bgColor = '';
                          diffStyle = { backgroundColor: getGradientColor(score) };
                        } else if (matrixViewMode === 'arrows') {
                          // Visualização com setas
                          if (direction === 'D') {
                            arrowSymbol = '↖';
                          } else if (direction === 'U') {
                            arrowSymbol = '↑';
                          } else if (direction === 'L') {
                            arrowSymbol = '←';
                          }
                        } else if (matrixViewMode === 'highlight') {
                          // Modo de destaque
                          if (shouldHighlightCell(i, j)) {
                            diffStyle = { 
                              backgroundColor: 'rgba(14, 165, 233, 0.6)',
                              boxShadow: '0 0 5px rgba(14, 165, 233, 0.8) inset'
                            };
                          }
                        }

                        // Adicionar destaque para célula selecionada em qualquer modo
                        if (selectedCell && selectedCell.i === i && selectedCell.j === j && matrixViewMode !== 'highlight') {
                          diffStyle = {
                            ...diffStyle,
                            boxShadow: '0 0 0 2px white inset'
                          };
                        }
                        
                        // Destacar diferenças entre células adjacentes
                        let diffHighlight = null;
                        if (showDifferenceHighlight && i > 0 && j > 0) {
                          const diagonal = scoreMatrix[i-1][j-1];
                          const up = scoreMatrix[i-1][j];
                          const left = scoreMatrix[i][j-1];
                          
                          const diagonalDiff = score - diagonal;
                          const upDiff = score - up;
                          const leftDiff = score - left;
                          
                          diffHighlight = (
                            <div className="absolute text-[9px] flex flex-col opacity-70">
                              <span className={`${diagonalDiff > 0 ? 'text-green-400' : 'text-red-400'}`} style={{position: 'absolute', top: '-12px', left: '-12px'}}>
                                {diagonalDiff > 0 ? '+' : ''}{diagonalDiff}
                              </span>
                              <span className={`${upDiff > 0 ? 'text-green-400' : 'text-red-400'}`} style={{position: 'absolute', top: '-12px', left: '5px'}}>
                                {upDiff > 0 ? '+' : ''}{upDiff}
                              </span>
                              <span className={`${leftDiff > 0 ? 'text-green-400' : 'text-red-400'}`} style={{position: 'absolute', top: '5px', left: '-12px'}}>
                                {leftDiff > 0 ? '+' : ''}{leftDiff}
                              </span>
                            </div>
                          );
                        }
                      
                      return (
                          <td 
                            key={j} 
                            className={`border border-gray-600 p-2 ${bgColor} w-10 h-10 relative cursor-pointer hover:opacity-80 transition-opacity`}
                            style={diffStyle}
                            onClick={() => handleCellClick(i, j)}
                          >
                          <div>{score}</div>
                            {matrixViewMode === 'arrows' && (
                              <div className="text-xl absolute inset-0 flex items-center justify-center text-cyan-300">
                                {arrowSymbol}
                              </div>
                            )}
                            {matrixViewMode !== 'arrows' && (
                          <div className="absolute bottom-0 right-0 text-xs opacity-70">
                            {direction}
                          </div>
                            )}
                            {showDifferenceHighlight && diffHighlight}
                        </td>
                        );
                    })}
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Indicador de carregamento para próximos chunks */}
          {renderingChunks && renderedChunks.length * chunkSize < scoreMatrix.length && (
            <div className="mt-4 text-center text-sm flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-cyan-500"></div>
              <span>Scroll down to load more rows ({renderedChunks.length * chunkSize}/{scoreMatrix.length})</span>
            </div>
          )}
          
          {isMatrixCollapsed && (
            <div className="mt-2 text-center text-sm text-gray-400">
              <p>Matrix is collapsed. Showing rows/columns {collapsedRange.start}-{collapsedRange.end} of {scoreMatrix.length}.</p>
        </div>
          )}
          
          {selectedCell && (
            <div className="mt-4 bg-gray-800 p-3 rounded-lg text-sm">
              <h4 className="font-semibold mb-1">Célula Selecionada:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div>
                  <span className="text-gray-400">Posição:</span> {selectedCell.i}×{selectedCell.j}
        </div>
                <div>
                  <span className="text-gray-400">Valor:</span> {scoreMatrix[selectedCell.i][selectedCell.j]}
                </div>
                <div>
                  <span className="text-gray-400">Direção:</span> {tracebackMatrix[selectedCell.i][selectedCell.j]}
                </div>
                <div>
                  <span className="text-gray-400">Caracteres:</span> {selectedCell.i > 0 ? seq1[selectedCell.i-1] : '-'}×{selectedCell.j > 0 ? seq2[selectedCell.j-1] : '-'}
                </div>
              </div>
              {highlightAlignmentIndices.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-700">
                  <span className="text-gray-400">Posições destacadas no alinhamento:</span> {highlightAlignmentIndices.length}
                  <button 
                    onClick={() => setHighlightAlignmentIndices([])}
                    className="ml-2 px-2 py-0.5 text-xs rounded bg-gray-700 hover:bg-gray-600"
                  >
                    Limpar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render alignment visualization responsively
  const renderAlignment = () => {
    if (alignedSeq1.length === 0 || alignedSeq2.length === 0) return null
    
    // Visualização em blocos (estilo original)
    if (alignmentViewMode === 'blocks') {
    return (
      <div className="bg-gray-800 rounded-lg p-5 overflow-x-auto">
        <div className="flex flex-row flex-nowrap min-w-fit">
          {alignedSeq1.map((char, index) => (
            <div
              key={index}
              className={`p-2 font-mono w-8 h-8 flex items-center justify-center ${
                  highlightAlignmentIndices.includes(index) ? 'ring-2 ring-white scale-110 z-10' : ''
                } ${
                char === "-" ? "bg-red-500" : char === alignedSeq2[index] ? "bg-green-500" : "bg-yellow-500"
              }`}
            >
              {char}
            </div>
          ))}
        </div>
        <div className="flex flex-row flex-nowrap min-w-fit mt-1">
          {alignedSeq1.map((char, index) => (
              <div key={index} className={`p-2 font-mono w-8 h-8 flex items-center justify-center ${
                highlightAlignmentIndices.includes(index) ? 'text-white font-bold' : ''
              }`}>
              {char === alignedSeq2[index] ? "|" : char === "-" || alignedSeq2[index] === "-" ? " " : "."}
            </div>
          ))}
        </div>
        <div className="flex flex-row flex-nowrap min-w-fit">
          {alignedSeq2.map((char, index) => (
            <div
              key={index}
              className={`p-2 font-mono w-8 h-8 flex items-center justify-center ${
                  highlightAlignmentIndices.includes(index) ? 'ring-2 ring-white scale-110 z-10' : ''
                } ${
                char === "-" ? "bg-red-500" : char === alignedSeq1[index] ? "bg-green-500" : "bg-yellow-500"
              }`}
            >
              {char}
            </div>
          ))}
        </div>
      </div>
      );
    }
    
    // Visualização linear (estilo texto com cores)
    if (alignmentViewMode === 'linear') {
      // Dividir o alinhamento em grupos para melhor legibilidade
      const chunkSize = 50;
      const chunks: number[] = [];
      
      for (let i = 0; i < alignedSeq1.length; i += chunkSize) {
        chunks.push(i);
      }
      
      return (
        <div className="bg-gray-800 rounded-lg p-5">
          {chunks.map((startIndex, chunkIdx) => {
            const endIndex = Math.min(startIndex + chunkSize, alignedSeq1.length);
            const positions = Array.from({ length: endIndex - startIndex }, (_, i) => startIndex + i);
            
            return (
              <div key={chunkIdx} className="mb-6">
                <div className="text-gray-400 text-xs mb-1">Position: {startIndex + 1}-{endIndex}</div>
                <div className="font-mono text-sm sm:text-base md:text-lg break-all whitespace-pre-wrap">
                  <span className="text-gray-400 mr-2">Seq1:</span>
                  {positions.map(i => (
                    <span 
                      key={i} 
                      className={`
                        ${highlightAlignmentIndices.includes(i) ? 'font-bold ring-1 ring-white px-0.5' : ''}
                        ${
                        alignedSeq1[i] === "-" 
                          ? "text-red-500"
                          : alignedSeq1[i] === alignedSeq2[i]
                            ? "text-green-500"
                            : "text-yellow-500"
                      }`}
                    >
                      {alignedSeq1[i]}
                    </span>
                  ))}
                </div>
                <div className="font-mono text-sm sm:text-base md:text-lg my-1">
                  <span className="text-gray-400 mr-2 invisible">...:</span>
                  {positions.map(i => (
                    <span key={i} className={`${highlightAlignmentIndices.includes(i) ? 'font-bold text-white' : ''}`}>
                      {alignedSeq1[i] === alignedSeq2[i] ? "|" : alignedSeq1[i] === "-" || alignedSeq2[i] === "-" ? " " : "."}
                    </span>
                  ))}
                </div>
                <div className="font-mono text-sm sm:text-base md:text-lg break-all whitespace-pre-wrap">
                  <span className="text-gray-400 mr-2">Seq2:</span>
                  {positions.map(i => (
                    <span 
                      key={i} 
                      className={`
                        ${highlightAlignmentIndices.includes(i) ? 'font-bold ring-1 ring-white px-0.5' : ''}
                        ${
                        alignedSeq2[i] === "-" 
                          ? "text-red-500"
                          : alignedSeq2[i] === alignedSeq1[i]
                            ? "text-green-500"
                            : "text-yellow-500"
                      }`}
                    >
                      {alignedSeq2[i]}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    
    // Visualização compacta
    if (alignmentViewMode === 'compact') {
      return (
        <div className="bg-gray-800 rounded-lg p-5">
          <div className="font-mono text-sm break-all whitespace-pre-wrap bg-gray-900 p-4 rounded">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Seq1:</span>
              <span className="text-gray-400 text-xs">({alignedSeq1.length} characters)</span>
            </div>
            <div>
              {alignedSeq1.map((char, index) => (
                <span 
                  key={index} 
                  className={`
                    ${highlightAlignmentIndices.includes(index) ? 'font-bold ring-1 ring-white px-0.5' : ''}
                    ${
                    char === "-" 
                      ? "text-red-500"
                      : char === alignedSeq2[index]
                        ? "text-green-500"
                        : "text-yellow-500"
                    }`}
                >
                  {char}
                </span>
              ))}
            </div>
            <div className="border-t border-gray-700 my-2"></div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Seq2:</span>
              <span className="text-gray-400 text-xs">({alignedSeq2.length} characters)</span>
            </div>
            <div>
              {alignedSeq2.map((char, index) => (
                <span 
                  key={index} 
                  className={`
                    ${highlightAlignmentIndices.includes(index) ? 'font-bold ring-1 ring-white px-0.5' : ''}
                    ${
                    char === "-" 
                      ? "text-red-500"
                      : char === alignedSeq1[index]
                        ? "text-green-500"
                        : "text-yellow-500"
                    }`}
                >
                  {char}
                </span>
              ))}
            </div>
            <div className="border-t border-gray-700 my-2"></div>
            <div className="text-gray-400 mb-1">Matches:</div>
            <div>
              {alignedSeq1.map((char, index) => (
                <span key={index} className={`${highlightAlignmentIndices.includes(index) ? 'font-bold text-white' : ''}`}>
                  {char === alignedSeq2[index] ? "|" : char === "-" || alignedSeq2[index] === "-" ? " " : "."}
                </span>
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    // Visualização interativa
    if (alignmentViewMode === 'interactive') {
      return (
        <div className="bg-gray-800 rounded-lg p-5 relative">
          <div className="mb-6">
            <div className="text-sm text-gray-400 mb-2">
              Hover over characters to see details
            </div>
            
            {/* Tooltip fixo que não afeta o layout */}
            {hoveredIndex !== null && (
              <div className="fixed bg-gray-900 rounded p-3 text-sm shadow-lg z-50" 
                   style={{
                     top: '50%', 
                     right: '5%', 
                     transform: 'translateY(-50%)',
                     maxWidth: '250px',
                     pointerEvents: 'none' // Não interfere com os eventos de mouse
                   }}>
                <div className="font-bold border-b border-gray-700 pb-1 mb-2">Position: {hoveredIndex + 1}</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <div>Seq1:</div> 
                  <div className={alignedSeq1[hoveredIndex] === "-" ? "text-red-500 font-bold" : "text-white"}>
                    {alignedSeq1[hoveredIndex]}
                  </div>
                  <div>Seq2:</div> 
                  <div className={alignedSeq2[hoveredIndex] === "-" ? "text-red-500 font-bold" : "text-white"}>
                    {alignedSeq2[hoveredIndex]}
                  </div>
                  <div>Type:</div>
                  <div>
                    {alignedSeq1[hoveredIndex] === alignedSeq2[hoveredIndex] 
                      ? <span className="text-green-500">Match</span>
                      : alignedSeq1[hoveredIndex] === "-" || alignedSeq2[hoveredIndex] === "-"
                        ? <span className="text-red-500">Gap</span>
                        : <span className="text-yellow-500">Mismatch</span>
                    }
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Sequence 1:</div>
              <div className="flex flex-wrap">
                {alignedSeq1.map((char, index) => (
                  <div 
                    key={index} 
                    className={`
                      w-8 h-8 m-px flex items-center justify-center font-mono transition-all duration-150
                      ${index === hoveredIndex ? 'ring-2 ring-white scale-110 z-10' : ''}
                      ${highlightAlignmentIndices.includes(index) ? 'ring-2 ring-cyan-400 z-10' : ''}
                      ${char === "-" 
                        ? "bg-red-500"
                        : char === alignedSeq2[index]
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }
                    `}
                    onMouseEnter={() => handleHoverEnter(index)}
                    onMouseLeave={handleHoverLeave}
                  >
                    {char}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-400 mb-1">Sequence 2:</div>
              <div className="flex flex-wrap">
                {alignedSeq2.map((char, index) => (
                  <div 
                    key={index} 
                    className={`
                      w-8 h-8 m-px flex items-center justify-center font-mono transition-all duration-150
                      ${index === hoveredIndex ? 'ring-2 ring-white scale-110 z-10' : ''}
                      ${highlightAlignmentIndices.includes(index) ? 'ring-2 ring-cyan-400 z-10' : ''}
                      ${char === "-" 
                        ? "bg-red-500"
                        : char === alignedSeq1[index]
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }
                    `}
                    onMouseEnter={() => handleHoverEnter(index)}
                    onMouseLeave={handleHoverLeave}
                  >
                    {char}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Visualização detalhada com informações adicionais
    if (alignmentViewMode === 'detailed') {
      // Analisar o alinhamento para informações adicionais
      const analysisData = [];
      
      // Calcular pontuação cumulativa
      let cumulativeScore = 0;
      
      for (let i = 0; i < alignedSeq1.length; i++) {
        let positionScore = 0;
        let type = "";
        
        if (alignedSeq1[i] === "-" || alignedSeq2[i] === "-") {
          positionScore = gapPenalty;
          type = "gap";
        } else if (alignedSeq1[i] === alignedSeq2[i]) {
          positionScore = matchScore;
          type = "match";
        } else {
          positionScore = mismatchPenalty;
          type = "mismatch";
        }
        
        cumulativeScore += positionScore;
        
        analysisData.push({
          pos: i,
          char1: alignedSeq1[i],
          char2: alignedSeq2[i],
          type,
          positionScore,
          cumulativeScore
        });
      }
      
      // Dividir o alinhamento em grupos para melhor legibilidade
      const chunkSize = 20;
      const chunks: number[] = [];
      
      for (let i = 0; i < analysisData.length; i += chunkSize) {
        chunks.push(i);
      }
      
      return (
        <div className="bg-gray-800 rounded-lg p-5 overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="text-left">
                <th className="p-2 border-b border-gray-700">Position</th>
                <th className="p-2 border-b border-gray-700">Seq1</th>
                <th className="p-2 border-b border-gray-700">Seq2</th>
                <th className="p-2 border-b border-gray-700">Type</th>
                <th className="p-2 border-b border-gray-700">Score</th>
                <th className="p-2 border-b border-gray-700">Cumulative</th>
              </tr>
            </thead>
            <tbody>
              {analysisData.map((item, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-gray-800" : "bg-gray-750"}>
                  <td className="p-2 border-b border-gray-700">{i + 1}</td>
                  <td className={`p-2 border-b border-gray-700 font-mono ${
                    item.char1 === "-" 
                      ? "text-red-500"
                      : item.type === "match"
                        ? "text-green-500"
                        : "text-yellow-500"
                  }`}>
                    {item.char1}
                  </td>
                  <td className={`p-2 border-b border-gray-700 font-mono ${
                    item.char2 === "-" 
                      ? "text-red-500"
                      : item.type === "match"
                        ? "text-green-500"
                        : "text-yellow-500"
                  }`}>
                    {item.char2}
                  </td>
                  <td className={`p-2 border-b border-gray-700 ${
                    item.type === "match" 
                      ? "text-green-500"
                      : item.type === "gap"
                        ? "text-red-500"
                        : "text-yellow-500"
                  }`}>
                    {item.type === "match" ? "Match" : item.type === "gap" ? "Gap" : "Mismatch"}
                  </td>
                  <td className="p-2 border-b border-gray-700">
                    <span className={item.positionScore > 0 ? "text-green-500" : "text-red-500"}>
                      {item.positionScore > 0 ? "+" : ""}{item.positionScore}
                    </span>
                  </td>
                  <td className="p-2 border-b border-gray-700">
                    <span className={item.cumulativeScore > 0 ? "text-green-500" : "text-red-500"}>
                      {item.cumulativeScore}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    
    // Novo modo de visualização comparativa
    if (alignmentViewMode === 'comparative') {
      // Calculate alignment metrics
      const totalPositions = alignedSeq1.length;
      const matches = statistics.matches;
      const mismatches = statistics.mismatches;
      const gaps = statistics.gaps;
      
      // Calculate position-by-position similarity
      const similarityData = [];
      let rollingAverage = [];
      const windowSize = 5; // Size of the rolling window
      
      for (let i = 0; i < alignedSeq1.length; i++) {
        // Calculate similarity at this position (1 for match, 0 for mismatch, -1 for gaps)
        let similarity = 0;
        
        if (alignedSeq1[i] === alignedSeq2[i]) {
          similarity = 1; // Match
        } else if (alignedSeq1[i] === '-' || alignedSeq2[i] === '-') {
          similarity = -1; // Gap
        } else {
          similarity = 0; // Mismatch
        }
        
        // Update rolling window
        rollingAverage.push(similarity);
        if (rollingAverage.length > windowSize) {
          rollingAverage.shift();
        }
        
        // Calculate average similarity in the current window
        const avgSimilarity = rollingAverage.reduce((sum, val) => sum + val, 0) / rollingAverage.length;
        
        similarityData.push({
          position: i + 1,
          similarity: similarity,
          rollingAverage: avgSimilarity
        });
      }
      
      // Count nucleotide/amino acid frequencies
      const seq1Counts: {[key: string]: number} = {};
      const seq2Counts: {[key: string]: number} = {};
      
      // Count without gaps
      alignedSeq1.forEach(char => {
        if (char !== '-') {
          seq1Counts[char] = (seq1Counts[char] || 0) + 1;
        }
      });
      
      alignedSeq2.forEach(char => {
        if (char !== '-') {
          seq2Counts[char] = (seq2Counts[char] || 0) + 1;
        }
      });
      
      // Get all unique characters
      const allChars = Array.from(new Set([...alignedSeq1, ...alignedSeq2])).filter(char => char !== '-');
      
      // Função para aplicar zoom nos gráficos
      const handleZoomChange = (start: number, end: number) => {
        setZoomRange({ start, end });
      };
      
      // Definir os dados visíveis com base no zoom
      const visibleData = zoomRange 
        ? similarityData.slice(zoomRange.start, zoomRange.end + 1)
        : similarityData;
      
      // Calcular as marcas do eixo x com base nos dados visíveis
      const xLabels = zoomRange
        ? [
            zoomRange.start,
            Math.round(zoomRange.start + (zoomRange.end - zoomRange.start) * 0.25),
            Math.round(zoomRange.start + (zoomRange.end - zoomRange.start) * 0.5),
            Math.round(zoomRange.start + (zoomRange.end - zoomRange.start) * 0.75),
            zoomRange.end
          ]
        : [
            0,
            Math.round(alignedSeq1.length * 0.25),
            Math.round(alignedSeq1.length * 0.5),
            Math.round(alignedSeq1.length * 0.75),
            alignedSeq1.length
          ];

      return (
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Botões de zoom compartilhados */}
            

            {/* Comparative Overview Chart */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-md font-semibold mb-3">Alignment Composition</h3>
              <div className="relative h-32 w-full">
                <div className="absolute inset-0 flex">
                  {/* Match section */}
                  <div 
                    className="h-full bg-green-500 flex items-center justify-center text-xs md:text-sm font-medium"
                    style={{ width: `${(matches / totalPositions) * 100}%` }}
                  >
                    <span className="p-1 bg-black/40 rounded">
                      {matches} <span className="hidden sm:inline">Matches</span>
                      <br />
                      {Math.round((matches / totalPositions) * 100)}%
                    </span>
                  </div>
                  
                  {/* Mismatch section */}
                  <div 
                    className="h-full bg-yellow-500 flex items-center justify-center text-xs md:text-sm font-medium"
                    style={{ width: `${(mismatches / totalPositions) * 100}%` }}
                  >
                    <span className="p-1 bg-black/40 rounded">
                      {mismatches} <span className="hidden sm:inline">Mismatches</span>
                      <br />
                      {Math.round((mismatches / totalPositions) * 100)}%
                    </span>
                  </div>
                  
                  {/* Gap section */}
                  <div 
                    className="h-full bg-red-500 flex items-center justify-center text-xs md:text-sm font-medium"
                    style={{ width: `${(gaps / totalPositions) * 100}%` }}
                  >
                    <span className="p-1 bg-black/40 rounded">
                      {gaps} <span className="hidden sm:inline">Gaps</span>
                      <br />
                      {Math.round((gaps / totalPositions) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <div>0</div>
                <div>{Math.round(totalPositions / 4)}</div>
                <div>{Math.round(totalPositions / 2)}</div>
                <div>{Math.round(3 * totalPositions / 4)}</div>
                <div>{totalPositions}</div>
              </div>
            </div>
            
            {/* Sequence Composition Comparison */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-md font-semibold mb-3">Sequence Composition</h3>
              <div className="grid grid-cols-1 gap-1">
                {allChars.map(char => {
                  const seq1Count = seq1Counts[char] || 0;
                  const seq2Count = seq2Counts[char] || 0;
                  const maxCount = Math.max(seq1Count, seq2Count);
                  const barWidth1 = maxCount > 0 ? (seq1Count / maxCount) * 100 : 0;
                  const barWidth2 = maxCount > 0 ? (seq2Count / maxCount) * 100 : 0;
                  
                  return (
                    <div key={char} className="flex items-center mb-1">
                      <div className="w-6 font-mono text-center">{char}</div>
                      <div className="w-full flex items-center">
                        <div className="w-1/2 flex justify-end pr-1">
                          <div 
                            className="h-4 bg-cyan-500 rounded-l" 
                            style={{ width: `${barWidth1}%` }}
                          ></div>
                        </div>
                        <div className="text-xs px-2">{seq1Count}/{seq2Count}</div>
                        <div className="w-1/2 pl-1">
                          <div 
                            className="h-4 bg-purple-500 rounded-r" 
                            style={{ width: `${barWidth2}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-center text-xs text-gray-400 mt-2">
                <div className="flex items-center mr-4">
                  <div className="w-3 h-3 bg-cyan-500 mr-1 rounded"></div>
                  <span>Seq1</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 mr-1 rounded"></div>
                  <span>Seq2</span>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2 flex gap-2 mb-2">
              <button
                onClick={() => setZoomRange(null)}
                className={`px-3 py-1 text-xs rounded ${!zoomRange ? 'bg-cyan-600' : 'bg-gray-700'}`}
              >
                View All
              </button>
              {alignedSeq1.length > 10 && (
                <>
                  <button
                    onClick={() => {
                      // Dividir em 3 partes iguais e mostrar a primeira parte
                      const sectionSize = Math.ceil(alignedSeq1.length / 3);
                      handleZoomChange(0, sectionSize - 1);
                    }}
                    className={`px-3 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600`}
                  >
                    Start (1/3)
                  </button>
                  <button
                    onClick={() => {
                      // Dividir em 3 partes iguais e mostrar a parte do meio
                      const sectionSize = Math.ceil(alignedSeq1.length / 3);
                      const startIndex = sectionSize;
                      const endIndex = Math.min(alignedSeq1.length - 1, startIndex + sectionSize - 1);
                      handleZoomChange(startIndex, endIndex);
                    }}
                    className={`px-3 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600`}
                  >
                    Middle (1/3)
                  </button>
                  <button
                    onClick={() => {
                      // Dividir em 3 partes iguais e mostrar a última parte
                      const sectionSize = Math.ceil(alignedSeq1.length / 3);
                      const startIndex = sectionSize * 2;
                      handleZoomChange(startIndex, alignedSeq1.length - 1);
                    }}
                    className={`px-3 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600`}
                  >
                    End (1/3)
                  </button>
                  <select
                    className="px-3 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600 ml-2"
                    onChange={(e) => {
                      const divisions = parseInt(e.target.value, 10);
                      if (divisions) {
                        // Calcular tamanho de cada divisão
                        const sectionSize = Math.ceil(alignedSeq1.length / divisions);
                        // Posicionar no meio
                        const midPoint = Math.floor(divisions / 2);
                        const startIndex = midPoint * sectionSize;
                        const endIndex = Math.min(alignedSeq1.length - 1, startIndex + sectionSize - 1);
                        handleZoomChange(startIndex, endIndex);
                      } else {
                        // Opção "Personalizado"
                        setZoomRange(null);
                      }
                    }}
                    defaultValue="0"
                  >
                    <option value="0">Divisions...</option>
                    <option value="2">2 parts</option>
                    <option value="3">3 parts</option>
                    <option value="4">4 parts</option>
                    <option value="5">5 parts</option>
                    <option value="8">8 parts</option>
                    <option value="10">10 parts</option>
                  </select>
                </>
              )}
              {zoomRange && (
                <div className="ml-auto text-xs text-gray-400">
                  Zoom: positions {zoomRange.start+1} - {zoomRange.end+1} ({zoomRange.end - zoomRange.start + 1} bases)
                </div>
              )}
            </div>
            
            {/* Controles de navegação horizontal */}
            {zoomRange && (
              <div className="md:col-span-2 flex justify-between items-center gap-2 mb-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (!zoomRange) return;
                      
                      const windowSize = zoomRange.end - zoomRange.start + 1;
                      // Mover para o início
                      handleZoomChange(0, windowSize - 1);
                    }}
                    disabled={zoomRange?.start === 0}
                    className={`px-3 py-1 text-xs rounded ${zoomRange?.start === 0 ? 'bg-gray-800 opacity-50 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'}`}
                    title="Go to start"
                  >
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                      </svg>
                      Start
                    </span>
                  </button>
                  
                  <button
                    onClick={() => {
                      if (!zoomRange) return;
                      
                      const windowSize = zoomRange.end - zoomRange.start + 1;
                      const stepSize = Math.max(1, Math.floor(windowSize * 0.5)); // Mover 50% da janela
                      const newStart = Math.max(0, zoomRange.start - stepSize);
                      const newEnd = newStart + windowSize - 1;
                      
                      handleZoomChange(newStart, newEnd);
                    }}
                    disabled={zoomRange?.start === 0}
                    className={`px-3 py-1 text-xs rounded ${zoomRange?.start === 0 ? 'bg-gray-800 opacity-50 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'}`}
                    title="Move left"
                  >
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </span>
                  </button>
                  
                  <button
                    onClick={() => {
                      if (!zoomRange) return;
                      
                      const windowSize = zoomRange.end - zoomRange.start + 1;
                      const stepSize = Math.max(1, Math.floor(windowSize * 0.1)); // Mover 10% da janela
                      const newStart = Math.max(0, zoomRange.start - stepSize);
                      const newEnd = newStart + windowSize - 1;
                      
                      handleZoomChange(newStart, newEnd);
                    }}
                    disabled={zoomRange?.start === 0}
                    className={`px-3 py-1 text-xs rounded ${zoomRange?.start === 0 ? 'bg-gray-800 opacity-50 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'}`}
                    title="Small shift to the left"
                  >
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5 5-5" />
                      </svg>
                    </span>
                  </button>
                </div>
                
                <div className="mx-auto">
                  <input
                    type="range"
                    min={0}
                    max={Math.max(0, alignedSeq1.length - (zoomRange.end - zoomRange.start + 1))}
                    value={zoomRange.start}
                    onChange={(e) => {
                      const newStart = parseInt(e.target.value, 10);
                      const windowSize = zoomRange.end - zoomRange.start + 1;
                      const newEnd = Math.min(alignedSeq1.length - 1, newStart + windowSize - 1);
                      handleZoomChange(newStart, newEnd);
                    }}
                    className="w-32 md:w-64 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    title="Slide to navigate horizontally"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (!zoomRange) return;
                      
                      const windowSize = zoomRange.end - zoomRange.start + 1;
                      const stepSize = Math.max(1, Math.floor(windowSize * 0.1)); // Mover 10% da janela
                      const newEnd = Math.min(alignedSeq1.length - 1, zoomRange.end + stepSize);
                      const newStart = Math.max(0, newEnd - windowSize + 1);
                      
                      handleZoomChange(newStart, newEnd);
                    }}
                    disabled={zoomRange?.end === alignedSeq1.length - 1}
                    className={`px-3 py-1 text-xs rounded ${zoomRange?.end === alignedSeq1.length - 1 ? 'bg-gray-800 opacity-50 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'}`}
                    title="Small shift to the right"
                  >
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5" />
                      </svg>
                    </span>
                  </button>
                  
                  <button
                    onClick={() => {
                      if (!zoomRange) return;
                      
                      const windowSize = zoomRange.end - zoomRange.start + 1;
                      const stepSize = Math.max(1, Math.floor(windowSize * 0.5)); // Mover 50% da janela
                      const newEnd = Math.min(alignedSeq1.length - 1, zoomRange.end + stepSize);
                      const newStart = Math.max(0, newEnd - windowSize + 1);
                      
                      handleZoomChange(newStart, newEnd);
                    }}
                    disabled={zoomRange?.end === alignedSeq1.length - 1}
                    className={`px-3 py-1 text-xs rounded ${zoomRange?.end === alignedSeq1.length - 1 ? 'bg-gray-800 opacity-50 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'}`}
                    title="Move right"
                  >
                    <span className="flex items-center">
                      Next
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </button>
                  
                  <button
                    onClick={() => {
                      if (!zoomRange) return;
                      
                      const windowSize = zoomRange.end - zoomRange.start + 1;
                      const newEnd = alignedSeq1.length - 1;
                      const newStart = Math.max(0, newEnd - windowSize + 1);
                      
                      handleZoomChange(newStart, newEnd);
                    }}
                    disabled={zoomRange?.end === alignedSeq1.length - 1}
                    className={`px-3 py-1 text-xs rounded ${zoomRange?.end === alignedSeq1.length - 1 ? 'bg-gray-800 opacity-50 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'}`}
                    title="Go to end"
                  >
                    <span className="flex items-center">
                      End
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    </span>
                  </button>
                </div>
              </div>
            )}
            
            {/* Similarity Profile */}
            <div className="bg-gray-900 rounded-lg p-4 md:col-span-2">
              <h3 className="text-md font-semibold mb-3">Similarity Profile</h3>
              <div className="relative h-40">
                {/* Baseline (zero line) */}
                <div className="absolute w-full h-px bg-gray-500 top-1/2 left-0"></div>
                
                {/* Position markers */}
                <div className="absolute w-full bottom-0 left-0 flex justify-between text-xs text-gray-400">
                  {xLabels.map(position => (
                    <div key={position} className="flex flex-col items-center">
                      <div className="h-1 w-px bg-gray-500 mb-1"></div>
                      {position + 1}
                    </div>
                  ))}
                </div>
                
                {/* Plot similarity points and rolling average */}
                <svg className="absolute inset-0 w-full h-full" 
                     viewBox={zoomRange 
                       ? `${zoomRange.start} 0 ${zoomRange.end - zoomRange.start + 1} 2` 
                       : `0 0 ${alignedSeq1.length} 2`} 
                     preserveAspectRatio="none">
                  {/* Rolling average line */}
                  <polyline 
                    points={visibleData.map(d => `${d.position - 1},${1 - (d.rollingAverage + 1) / 2}`).join(' ')}
                    fill="none"
                    stroke="rgba(14, 165, 233, 0.7)"
                    strokeWidth="0.02"
                  />
                  
                  {/* Individual points */}
                  {visibleData.map((d, i) => (
                    <circle 
                      key={i}
                      cx={d.position - 1}
                      cy={1 - (d.similarity + 1) / 2}
                      r="0.03"
                      fill={
                        d.similarity === 1 ? 'rgb(34, 197, 94)' : 
                        d.similarity === 0 ? 'rgb(234, 179, 8)' : 
                        'rgb(239, 68, 68)'
                      }
                    />
                  ))}
                </svg>
              </div>
              
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 mr-1 rounded"></div>
                  <span>Match</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 mr-1 rounded"></div>
                  <span>Mismatch</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 mr-1 rounded"></div>
                  <span>Gap</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-sky-500 mr-1 rounded"></div>
                  <span>Trend</span>
                </div>
              </div>
            </div>

            {/* Conservation Score / Alignment Regions */}
            <div className="bg-gray-900 rounded-lg p-4 md:col-span-2">
              <h3 className="text-md font-semibold mb-3">Alignment Regions</h3>
              <div className="w-full h-10 flex">
                {visibleData.map((d, i) => {
                  let color = 'bg-gray-700';
                  
                  // Check for conserved regions (consistent matching)
                  if (i > 0 && i < visibleData.length - 1) {
                    // Sistema de cores mais detalhado e exato
                    if (d.rollingAverage > 0.9) {
                      color = 'bg-green-800'; // Altamente conservado (90-100%)
                    } else if (d.rollingAverage > 0.7) {
                      color = 'bg-green-600'; // Muito conservado (70-90%)
                    } else if (d.rollingAverage > 0.5) {
                      color = 'bg-green-500'; // Conservado (50-70%)
                    } else if (d.rollingAverage > 0.3) {
                      color = 'bg-green-400'; // Moderadamente conservado (30-50%)
                    } else if (d.rollingAverage > 0.1) {
                      color = 'bg-yellow-400'; // Levemente conservado (10-30%)
                    } else if (d.rollingAverage > -0.1) {
                      color = 'bg-yellow-600'; // Neutro (-10% a 10%)
                    } else if (d.rollingAverage > -0.3) {
                      color = 'bg-orange-500'; // Levemente divergente (-30% a -10%)
                    } else if (d.rollingAverage > -0.5) {
                      color = 'bg-orange-700'; // Moderadamente divergente (-50% a -30%)
                    } else if (d.rollingAverage > -0.7) {
                      color = 'bg-red-500'; // Divergente (-70% a -50%)
                    } else if (d.rollingAverage > -0.9) {
                      color = 'bg-red-600'; // Muito divergente (-90% a -70%)
                    } else {
                      color = 'bg-red-800'; // Altamente divergente (-100% a -90%)
                    }
                  }
                  
                  return (
                    <div
                      key={i}
                      className={`h-full ${color}`}
                      style={{ width: `${100 / visibleData.length}%` }}
                      title={`Position ${d.position}: ${alignedSeq1[d.position-1]}/${alignedSeq2[d.position-1]}, Conservation: ${(d.rollingAverage * 100).toFixed(1)}%`}
                    ></div>
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                {xLabels.map(position => (
                  <div key={position}>{position + 1}</div>
                ))}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-11 gap-y-2 text-xs text-gray-400 mt-3 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-full h-3 bg-green-800 mb-1 rounded"></div>
                  <span>90-100%</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-full h-3 bg-green-600 mb-1 rounded"></div>
                  <span>70-90%</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-full h-3 bg-green-500 mb-1 rounded"></div>
                  <span>50-70%</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-full h-3 bg-green-400 mb-1 rounded"></div>
                  <span>30-50%</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-full h-3 bg-yellow-400 mb-1 rounded"></div>
                  <span>10-30%</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-full h-3 bg-yellow-600 mb-1 rounded"></div>
                  <span>±10%</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-full h-3 bg-orange-500 mb-1 rounded"></div>
                  <span>-10-30%</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-full h-3 bg-orange-700 mb-1 rounded"></div>
                  <span>-30-50%</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-full h-3 bg-red-500 mb-1 rounded"></div>
                  <span>-50-70%</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-full h-3 bg-red-600 mb-1 rounded"></div>
                  <span>-70-90%</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-full h-3 bg-red-800 mb-1 rounded"></div>
                  <span>-90-100%</span>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-gray-400 mt-4">
                <div className="flex items-center">
                  <span className="font-semibold text-green-500">Conserved:</span>
                  <span className="ml-1">similar sequences, likely functional importance</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-yellow-500">Variable:</span>
                  <span className="ml-1">regions with moderate variability</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-red-500">Divergent:</span>
                  <span className="ml-1">regions with high differentiation or gaps</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  }

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
      <p className="text-cyan-400 text-lg">{progressStatus}</p>
      <p className="text-gray-400 text-sm mt-2">Processing sequences...</p>
    </div>
  )

  return (
    <main className="w-full flex min-h-screen flex-col items-center justify-between bg-gradient-to-l from-cyan-950 to-black">
      <div className="w-full max-w-[2880px] mx-auto text-white px-4">
        <div className="pt-10 px-2 md:px-5">
          <div className="flex justify-between items-center">
            <Link href="/" className="font-bold text-gray-100 transition-all">
              ← Back
            </Link>
            <button 
              onClick={copyUrlToClipboard}
              className="bg-gray-700 hover:bg-gray-600 text-white py-1 px-3 rounded text-sm transition-all flex items-center gap-1"
            >
              {copySuccess ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Share URL
                </>
              )}
            </button>
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-center text-xl sm:text-2xl md:text-3xl font-bold my-8 text-white">Detailed Alignment Analysis</h1>
          </div>
        </div>

        {seq1 && seq2 ? (
          isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="p-3 sm:p-5 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-4 md:p-5">
                  <h2 className="text-lg md:text-xl font-bold mb-4">Algorithm Parameters</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="break-words">
                      <p className="text-gray-400">Sequence 1:</p>
                      <p className="font-mono break-all">{seq1}</p>
                    </div>
                    <div className="break-words">
                      <p className="text-gray-400">Sequence 2:</p>
                      <p className="font-mono break-all">{seq2}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Match Score:</p>
                      <p className="font-mono text-green-400">{matchScore}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Gap Penalty:</p>
                      <p className="font-mono text-red-400">{gapPenalty}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Mismatch Penalty:</p>
                      <p className="font-mono text-yellow-400">{mismatchPenalty}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Final Score:</p>
                      <p className="font-mono text-cyan-400">{alignmentScore}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4 md:p-5">
                  <h2 className="text-lg md:text-xl font-bold mb-4">Alignment Statistics</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <p className="text-gray-400">Length:</p>
                      <p className="font-mono">{statistics.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Identity:</p>
                      <p className="font-mono">{statistics.identity}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Matches:</p>
                      <p className="font-mono text-green-400">{statistics.matches}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Mismatches:</p>
                      <p className="font-mono text-yellow-400">{statistics.mismatches}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Gaps:</p>
                      <p className="font-mono text-red-400">{statistics.gaps}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg md:text-xl font-bold">Scoring Matrix</h2>
                  <div className="flex items-center">
                    <div className="bg-gray-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 cursor-help group relative">
                      <span className="text-xs text-gray-300">?</span>
                      <div className="absolute hidden group-hover:block bottom-full right-0 mb-2 w-64 p-2 bg-gray-900 rounded shadow-lg text-xs text-gray-300 z-10">
                        The scoring matrix is the central structure of the algorithm, where each cell 
                        represents the maximum score for the alignment of subsequences 
                        up to that point. Try different visualization modes to better understand 
                        how the algorithm works.
              </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 md:p-5 overflow-auto">
                  <p className="mb-4 text-gray-400 text-sm md:text-base">
                    A matriz de pontuação mostra os valores calculados durante a execução do algoritmo.
                    {matrixViewMode === 'standard' && (
                      <>
                        The colors indicate the type of operation: <span className="text-green-400">match</span>, 
                    <span className="text-yellow-400"> mismatch</span>, or <span className="text-red-400">gap</span>.
                        The letters in the bottom right corner of each cell indicate the traceback direction:
                    D (diagonal), U (up), L (left).
                      </>
                    )}
                    {matrixViewMode === 'heatmap' && (
                      <>
                        The heatmap represents numerical values: warmer tones (red) 
                        indicate higher values and cooler tones (blue) indicate lower values.
                      </>
                    )}
                    {matrixViewMode === 'arrows' && (
                      <>
                        The arrows indicate the traceback direction: ↖ (diagonal), ↑ (up), ← (left).
                        These arrows show the path the algorithm follows to build the final alignment.
                      </>
                    )}
                    {matrixViewMode === 'colorful' && (
                      <>
                        Visualization with vibrant colors representing matrix values in a rainbow spectrum,
                        facilitating identification of patterns and high-value regions.
                      </>
                    )}
                    {matrixViewMode === 'gradient' && (
                      <>
                        Visualization with color gradient based on values, with green for
                        positive values and red for negative values, varying in intensity.
                      </>
                    )}
                    {matrixViewMode === 'highlight' && (
                      <>
                        Visualization that highlights specific cells based on criteria.
                        Click on cells to select them and choose a highlight mode to see patterns and insights in the alignment matrix.
                      </>
                    )}
                  </p>
                  {renderMatrix()}
                </div>
              </div>

              <div className="mt-10">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg md:text-xl font-bold">Alignment Visualization</h2>
                  <div className="flex items-center">
                    <div className="bg-gray-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 cursor-help group relative">
                      <span className="text-xs text-gray-300">?</span>
                      <div className="absolute hidden group-hover:block bottom-full right-0 mb-2 w-64 p-2 bg-gray-900 rounded shadow-lg text-xs text-gray-300 z-10">
                        This section shows the final alignment of the two sequences after
                        applying the Needleman-Wunsch algorithm. Gaps (-) are inserted
                        to optimize the alignment according to the defined parameters.
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 mb-4">
                  <button 
                    onClick={() => setAlignmentViewMode('blocks')}
                    className={`px-3 py-1 text-sm rounded ${alignmentViewMode === 'blocks' ? 'bg-cyan-600' : 'bg-gray-700'}`}
                    title="Visualization of characters in colored blocks"
                  >
                    Block View
                  </button>
                  <button 
                    onClick={() => setAlignmentViewMode('linear')}
                    className={`px-3 py-1 text-sm rounded ${alignmentViewMode === 'linear' ? 'bg-cyan-600' : 'bg-gray-700'}`}
                    title="Display in text format with colors for easier reading"
                  >
                    Linear View
                  </button>
                  <button 
                    onClick={() => setAlignmentViewMode('detailed')}
                    className={`px-3 py-1 text-sm rounded ${alignmentViewMode === 'detailed' ? 'bg-cyan-600' : 'bg-gray-700'}`}
                    title="Position-by-position analysis with scoring details"
                  >
                    Detailed Analysis
                  </button>
                  <button 
                    onClick={() => setAlignmentViewMode('compact')}
                    className={`px-3 py-1 text-sm rounded ${alignmentViewMode === 'compact' ? 'bg-cyan-600' : 'bg-gray-700'}`}
                    title="Compact view of aligned sequences"
                  >
                    Compact View
                  </button>
                  <button 
                    onClick={() => setAlignmentViewMode('interactive')}
                    className={`px-3 py-1 text-sm rounded ${alignmentViewMode === 'interactive' ? 'bg-cyan-600' : 'bg-gray-700'}`}
                    title="Interactive visualization with hover details"
                  >
                    Interactive View
                  </button>
                  <button 
                    onClick={() => setAlignmentViewMode('comparative')}
                    className={`px-3 py-1 text-sm rounded ${alignmentViewMode === 'comparative' ? 'bg-cyan-600' : 'bg-gray-700'}`}
                    title="Comparative charts and analytics"
                  >
                    Comparative Charts
                  </button>
                </div>
                {alignmentViewMode === 'detailed' && (
                  <div className="bg-gray-700/50 rounded-lg p-3 mb-4 text-sm">
                    <p className="text-gray-300">
                      This visualization presents a detailed analysis of the alignment.
                      Each row shows a pair of aligned characters, their type (match, mismatch, or gap),
                      the score at that position, and the cumulative score up to that point.
                    </p>
                  </div>
                )}
                {/* {alignmentViewMode === 'comparative' && (
                  <div className="bg-gray-700/50 rounded-lg p-3 mb-4 text-sm">
                    <p className="text-gray-300">
                      This view provides analytical charts to better understand the alignment characteristics.
                      It includes composition analysis, sequence comparison, similarity profiles, and 
                      conservation regions to help identify patterns and features in the alignment.
                    </p>
                  </div>
                )} */}
                {renderAlignment()}
              </div>

              <div className="mt-10">
                <h2 className="text-lg md:text-xl font-bold mb-4">Algorithm Explanation</h2>
                <div className="bg-gray-800 rounded-lg p-4 md:p-5">
                  <p className="mb-2 text-sm md:text-base">The Needleman-Wunsch algorithm is a method for global sequence alignment that follows these steps:</p>
                  <ol className="list-decimal pl-5 space-y-2 text-sm md:text-base">
                    <li>
                      <strong>Initialization:</strong> Create a scoring matrix and fill the first row and column with accumulated gap values.
                    </li>
                    <li>
                      <strong>Matrix Filling:</strong> For each cell in the matrix, calculate the best value considering:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Diagonal (match/mismatch): value from the upper-left diagonal cell + match/mismatch score</li>
                        <li>Up (gap): value from the cell above + gap penalty</li>
                        <li>Left (gap): value from the cell to the left + gap penalty</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Traceback:</strong> Starting from the bottom-right cell, follow the path of highest scores to build the alignment.
                    </li>
                  </ol>
                  <p className="mt-4 text-sm md:text-base">
                    The final result is the optimized alignment of the two sequences, where the total score is maximized.
                  </p>
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="p-5 text-center text-gray-400">
            <p>No parameters provided. Return to the main page and enter sequences for analysis.</p>
          </div>
        )}
      </div>

      <div className="w-full bg-black/0 h-[100px] px-5 md:px-10 py-5 text-white flex items-center justify-center gap-1 sm:gap-5 mt-10">
        <h1 className="text-xs md:text-md">© 2024-2030 RGB Logic - All Rights Reserved</h1>
        <a className="underline hover:text-blue-500 transition-all" href="https://github.com/sirguilherme97/" target="blank">Github</a>
      </div>
    </main>
  )
}

// Componente principal envolvido em Suspense
export default function InfoPage() {
  return (
    <Suspense fallback={
      <div className="w-full flex min-h-screen flex-col items-center justify-center bg-gradient-to-l from-cyan-950 to-black">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
        <p className="text-cyan-400 text-lg">Carregando...</p>
      </div>
    }>
      <InfoPageContent />
    </Suspense>
  )
} 