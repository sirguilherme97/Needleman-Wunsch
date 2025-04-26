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
  const [matrixViewMode, setMatrixViewMode] = useState<'standard' | 'heatmap' | 'arrows'>('standard')
  const [showDifferenceHighlight, setShowDifferenceHighlight] = useState(false)
  const [alignmentViewMode, setAlignmentViewMode] = useState<'blocks' | 'linear' | 'detailed'>('blocks')

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

  // Render matrix with colored values
  const renderMatrix = () => {
    if (!seq1 || !seq2 || scoreMatrix.length === 0) return null

    // Cálculo do valor mínimo e máximo para o heatmap
    let minValue = Infinity;
    let maxValue = -Infinity;
    
    if (matrixViewMode === 'heatmap') {
      scoreMatrix.forEach(row => {
        row.forEach(score => {
          minValue = Math.min(minValue, score);
          maxValue = Math.max(maxValue, score);
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

    return (
      <div className="overflow-x-auto mt-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <button 
            onClick={() => setMatrixViewMode('standard')}
            className={`px-3 py-1 text-sm rounded ${matrixViewMode === 'standard' ? 'bg-cyan-600' : 'bg-gray-700'}`}
          >
            Padrão
          </button>
          <button 
            onClick={() => setMatrixViewMode('heatmap')}
            className={`px-3 py-1 text-sm rounded ${matrixViewMode === 'heatmap' ? 'bg-cyan-600' : 'bg-gray-700'}`}
          >
            Mapa de calor
          </button>
          <button 
            onClick={() => setMatrixViewMode('arrows')}
            className={`px-3 py-1 text-sm rounded ${matrixViewMode === 'arrows' ? 'bg-cyan-600' : 'bg-gray-700'}`}
          >
            Setas de traceback
          </button>
          <label className="flex items-center gap-2 ml-auto">
            <input 
              type="checkbox" 
              checked={showDifferenceHighlight} 
              onChange={() => setShowDifferenceHighlight(!showDifferenceHighlight)}
              className="rounded text-cyan-600 focus:ring-cyan-500"
            />
            <span className="text-sm">Destacar diferenças entre células</span>
          </label>
        </div>
        <table className="border-collapse text-center min-w-fit">
          <thead>
            <tr>
              <th className="border border-gray-600 p-2 bg-gray-800"></th>
              <th className="border border-gray-600 p-2 bg-gray-800"></th>
              {seq2.split('').map((char, idx) => (
                <th key={idx} className="border border-gray-600 p-2 bg-gray-800 w-10 h-10">{char}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scoreMatrix.map((row, i) => (
              <tr key={i}>
                <th className="border border-gray-600 p-2 bg-gray-800">
                  {i === 0 ? '' : seq1[i-1]}
                </th>
                {row.map((score, j) => {
                  // Determinar a direção do traceback
                  const direction = tracebackMatrix[i][j];
                  
                  // Determinar a cor de fundo com base no modo de visualização
                  let bgColor = 'bg-gray-700';
                  let arrowSymbol = '';
                  let diffStyle = {};
                  
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
                  } else if (matrixViewMode === 'arrows') {
                    // Visualização com setas
                    if (direction === 'D') {
                      arrowSymbol = '↖';
                    } else if (direction === 'U') {
                      arrowSymbol = '↑';
                    } else if (direction === 'L') {
                      arrowSymbol = '←';
                    }
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
                      className={`border border-gray-600 p-2 ${bgColor} w-10 h-10 relative`}
                      style={diffStyle}
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
            ))}
          </tbody>
        </table>
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
                  char === "-" ? "bg-red-500" : char === alignedSeq2[index] ? "bg-green-500" : "bg-yellow-500"
                }`}
              >
                {char}
              </div>
            ))}
          </div>
          <div className="flex flex-row flex-nowrap min-w-fit mt-1">
            {alignedSeq1.map((char, index) => (
              <div key={index} className="p-2 font-mono w-8 h-8 flex items-center justify-center">
                {char === alignedSeq2[index] ? "|" : char === "-" || alignedSeq2[index] === "-" ? " " : "."}
              </div>
            ))}
          </div>
          <div className="flex flex-row flex-nowrap min-w-fit">
            {alignedSeq2.map((char, index) => (
              <div
                key={index}
                className={`p-2 font-mono w-8 h-8 flex items-center justify-center ${
                  char === "-" ? "bg-red-500" : char === alignedSeq1[index] ? "bg-green-500" : "bg-yellow-500"
                }`}
              >
                {char}
              </div>
            ))}
          </div>
        </div>
      )
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
                <div className="text-gray-400 text-xs mb-1">Posição: {startIndex + 1}-{endIndex}</div>
                <div className="font-mono text-sm sm:text-base md:text-lg break-all whitespace-pre-wrap">
                  <span className="text-gray-400 mr-2">Seq1:</span>
                  {positions.map(i => (
                    <span 
                      key={i} 
                      className={
                        alignedSeq1[i] === "-" 
                          ? "text-red-500"
                          : alignedSeq1[i] === alignedSeq2[i]
                            ? "text-green-500"
                            : "text-yellow-500"
                      }
                    >
                      {alignedSeq1[i]}
                    </span>
                  ))}
                </div>
                <div className="font-mono text-sm sm:text-base md:text-lg my-1">
                  <span className="text-gray-400 mr-2 invisible">...:</span>
                  {positions.map(i => (
                    <span key={i}>
                      {alignedSeq1[i] === alignedSeq2[i] ? "|" : alignedSeq1[i] === "-" || alignedSeq2[i] === "-" ? " " : "."}
                    </span>
                  ))}
                </div>
                <div className="font-mono text-sm sm:text-base md:text-lg break-all whitespace-pre-wrap">
                  <span className="text-gray-400 mr-2">Seq2:</span>
                  {positions.map(i => (
                    <span 
                      key={i} 
                      className={
                        alignedSeq2[i] === "-" 
                          ? "text-red-500"
                          : alignedSeq2[i] === alignedSeq1[i]
                            ? "text-green-500"
                            : "text-yellow-500"
                      }
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
                <th className="p-2 border-b border-gray-700">Posição</th>
                <th className="p-2 border-b border-gray-700">Seq1</th>
                <th className="p-2 border-b border-gray-700">Seq2</th>
                <th className="p-2 border-b border-gray-700">Tipo</th>
                <th className="p-2 border-b border-gray-700">Pontuação</th>
                <th className="p-2 border-b border-gray-700">Acumulado</th>
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
                    {item.type === "match" ? "Correspondência" : item.type === "gap" ? "Gap" : "Incompatibilidade"}
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
                <h2 className="text-lg md:text-xl font-bold mb-4">Visualization Options</h2>
                <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-300">
                    Escolha diferentes modos de visualização para entender melhor o algoritmo Needleman-Wunsch 
                    e analisar o alinhamento de diferentes perspectivas. Cada modo oferece insights únicos 
                    sobre como as sequências são alinhadas.
                  </p>
                </div>
              </div>

              <div className="mt-10">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg md:text-xl font-bold">Matrix de Pontuação</h2>
                  <div className="flex items-center">
                    <div className="bg-gray-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 cursor-help group relative">
                      <span className="text-xs text-gray-300">?</span>
                      <div className="absolute hidden group-hover:block bottom-full right-0 mb-2 w-64 p-2 bg-gray-900 rounded shadow-lg text-xs text-gray-300 z-10">
                        A matriz de pontuação é a estrutura central do algoritmo, onde cada célula 
                        representa a pontuação máxima para o alinhamento das subsequências 
                        até aquele ponto. Experimente diferentes modos de visualização para entender 
                        melhor como o algoritmo funciona.
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 md:p-5 overflow-auto">
                  <p className="mb-4 text-gray-400 text-sm md:text-base">
                    A matriz de pontuação mostra os valores calculados durante a execução do algoritmo.
                    {matrixViewMode === 'standard' && (
                      <>
                        As cores indicam o tipo de operação: <span className="text-green-400">correspondência</span>, 
                        <span className="text-yellow-400"> incompatibilidade</span>, ou <span className="text-red-400">gap</span>.
                        As letras no canto inferior direito de cada célula indicam a direção do traceback:
                        D (diagonal), U (para cima), L (para esquerda).
                      </>
                    )}
                    {matrixViewMode === 'heatmap' && (
                      <>
                        O mapa de calor representa os valores numéricos: tons mais quentes (vermelho) 
                        indicam valores mais altos e tons mais frios (azul) indicam valores mais baixos.
                      </>
                    )}
                    {matrixViewMode === 'arrows' && (
                      <>
                        As setas indicam a direção do traceback: ↖ (diagonal), ↑ (para cima), ← (para esquerda).
                        Estas setas mostram o caminho que o algoritmo segue para construir o alinhamento final.
                      </>
                    )}
                  </p>
                  {renderMatrix()}
                </div>
              </div>

              <div className="mt-10">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg md:text-xl font-bold">Visualização do Alinhamento</h2>
                  <div className="flex items-center">
                    <div className="bg-gray-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 cursor-help group relative">
                      <span className="text-xs text-gray-300">?</span>
                      <div className="absolute hidden group-hover:block bottom-full right-0 mb-2 w-64 p-2 bg-gray-900 rounded shadow-lg text-xs text-gray-300 z-10">
                        Esta seção mostra o alinhamento final das duas sequências após a 
                        aplicação do algoritmo Needleman-Wunsch. Os gaps (-) são inseridos 
                        para otimizar o alinhamento conforme os parâmetros definidos.
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 mb-4">
                  <button 
                    onClick={() => setAlignmentViewMode('blocks')}
                    className={`px-3 py-1 text-sm rounded ${alignmentViewMode === 'blocks' ? 'bg-cyan-600' : 'bg-gray-700'}`}
                    title="Visualização de caracteres em blocos coloridos"
                  >
                    Visualização em blocos
                  </button>
                  <button 
                    onClick={() => setAlignmentViewMode('linear')}
                    className={`px-3 py-1 text-sm rounded ${alignmentViewMode === 'linear' ? 'bg-cyan-600' : 'bg-gray-700'}`}
                    title="Exibição em formato de texto com cores para facilitar a leitura"
                  >
                    Visualização linear
                  </button>
                  <button 
                    onClick={() => setAlignmentViewMode('detailed')}
                    className={`px-3 py-1 text-sm rounded ${alignmentViewMode === 'detailed' ? 'bg-cyan-600' : 'bg-gray-700'}`}
                    title="Análise posição por posição com detalhes de pontuação"
                  >
                    Análise detalhada
                  </button>
                </div>
                {alignmentViewMode === 'detailed' && (
                  <div className="bg-gray-700/50 rounded-lg p-3 mb-4 text-sm">
                    <p className="text-gray-300">
                      Esta visualização apresenta uma análise detalhada do alinhamento.
                      Cada linha mostra um par de caracteres alinhados, seu tipo (correspondência, incompatibilidade ou gap),
                      a pontuação daquela posição e a pontuação acumulada até aquele ponto.
                    </p>
                  </div>
                )}
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