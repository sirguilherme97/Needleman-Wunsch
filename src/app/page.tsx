'use client'
/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import NeedlemanWunschAlignment from "../components/Script"; // Make sure to correctly import the NeedlemanWunschAlignment component

export default function AlignmentContainer() {
    const [seq1, setSeq1] = useState("");
    const [seq2, setSeq2] = useState("");
    const [matchScore, setMatchScore] = useState(1); // Novo: score para match
    const [gapPenalty, setGapPenalty] = useState(-1);
    const [mismatchPenalty, setMismatchPenalty] = useState(-1);

    const handleSeq1Change = (event: any) => setSeq1(event.target.value.toUpperCase());
    const handleSeq2Change = (event: any) => setSeq2(event.target.value.toUpperCase());
    const handleMatchScoreChange = (event: any) => setMatchScore(Number(event.target.value));
    const handleGapPenaltyChange = (event: any) => setGapPenalty(Number(event.target.value));
    const handleMismatchPenaltyChange = (event: any) => setMismatchPenalty(Number(event.target.value));

    return (
        <>
            <div className="w-screen bg-gradient-to-l from-cyan-950 to-black h-auto py-5 flex flex-col items-center justify-start   text-white">
                <h1 className="text-white font-bold text-lg">Needleman-Wunsch Algorithm</h1>
                <h2 className="text-white font-medium text-lg">Sequence Alignment</h2>
                <div className="w-full max-w-2xl p-6 rounded-lg shadow-lg">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Sequence 1</label>
                                <input
                                    type="text"
                                    className="w-full h-10 p-2 rounded-md text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    placeholder="e.g., ATCG"
                                    value={seq1}
                                    onChange={handleSeq1Change}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Sequence 2</label>
                                <input
                                    type="text"
                                    className="w-full h-10 p-2 rounded-md text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    placeholder="e.g., AGCG"
                                    value={seq2}
                                    onChange={handleSeq2Change}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Match Score</label>
                                <input
                                    type="number"
                                    className="w-full h-10 p-2 rounded-md text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    placeholder="e.g., 1"
                                    value={matchScore}
                                    onChange={handleMatchScoreChange}
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Gap Penalty</label>
                                <input
                                    type="number"
                                    className="w-full h-10 p-2 rounded-md text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    placeholder="e.g., -1"
                                    value={gapPenalty}
                                    onChange={handleGapPenaltyChange}
                                    max="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Mismatch Penalty</label>
                                <input
                                    type="number"
                                    className="w-full h-10 p-2 rounded-md text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    placeholder="e.g., -1"
                                    value={mismatchPenalty}
                                    onChange={handleMismatchPenaltyChange}
                                    max="0"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="my-10 mg:my-20 w-full">
                    <NeedlemanWunschAlignment
                        seq1={seq1}
                        seq2={seq2}
                        matchScore={matchScore}
                        gapPenalty={gapPenalty}
                        mismatchPenalty={mismatchPenalty}
                    />
                </div>
                <div className="text-[#ededed] cursor-default grid grid-cols-1 md:grid-cols-2 pt-10 max-w-xl md:max-w-none px-5 md:px-10 md:py-32 bg-[#0e0e0e] w-full h-auto">
                    <div className="col-span-2 md:col-span-1 sm:mr-2">
                        <h1 className="font-bold text-white text-xl">Needleman-Wunsch Algorithm: Approach</h1>
                        <p className="mt-3 max-w-2xl">The Needleman-Wunsch algorithm is a fundamental technique in bioinformatics, widely used for global sequence alignment of DNA, RNA, or proteins. Developed by Saul B. Needleman and Christian D. Wunsch in 1970, this algorithm laid the groundwork for many subsequent alignment algorithms. Below, we provide a detailed explanation of this algorithm, highlighting its key concepts and steps.</p>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <h1 className="font-bold text-white">Introduction</h1>
                        <p className="mt-3 max-w-2xl">The Needleman-Wunsch algorithm is designed to find the best global alignment between two sequences, where "best" is defined as the alignment that maximizes the similarity between the sequences. It assigns scores for matches, mismatches, and gaps and calculates the best possible alignment within these parameters.</p>
                    </div>
                    <div className="col-span-2">
                        <h2 className="mt-10 font-bold text-white text-xl">Algorithm Steps</h2>
                        <p className="mt-3 "><span className="font-bold text-white">Scoring Matrix Initialization: </span> The first step of the algorithm involves creating a scoring matrix, where each cell represents the partial alignment between subsequences. The matrix is initialized with values based on penalties for matches, mismatches, and gaps.</p>
                        <p className="mt-0 "><span className="font-bold text-white">Matrix Filling:</span> The matrix is then filled iteratively. Each cell is populated with the maximum value obtained by considering the values of adjacent cells, along with penalties for match, mismatch, and gap. This filling occurs across all cells in the matrix.</p>
                        <p className="mt-0 "><span className="font-bold text-white">Optimal Path Traceback: </span> Once the matrix is filled, the next step is to trace the optimal path through the matrix. This is done by backtracking from the final cell to the initial cell, following the path that maximizes the total alignment score.</p>
                        <p className="mt-0 "><span className="font-bold text-white">Alignment Construction:</span> With the optimal path determined, the final alignment can be constructed. This involves associating the characters of the input sequences according to the optimal path, marking matches, mismatches, and gaps as appropriate.</p>
                    </div>
                    <div className="col-span-2">
                        <h2 className="font-bold text-white mt-10 text-xl">Scores and Penalties</h2>
                        <p className="mt-3"><span className="font-bold text-green-500">Match:</span> Score assigned when the characters at corresponding positions in the sequences are identical.</p>
                        <p className="mt-0"><span className="font-bold text-yellow-500">Mismatch:</span> Penalty assigned when the characters at corresponding positions in the sequences are different.</p>
                        <p className="mt-0"><span className="font-bold text-red-500">Gap:</span> Penalty assigned when a space is inserted into one of the sequences to perform the alignment.</p>
                    </div>
                    <div className="col-span-2 md:col-span-1 sm:mr-2">
                        <h2 className="mt-10 font-bold text-white text-xl">Applications</h2>
                        <p className="mt-3 max-w-lg">The Needleman-Wunsch algorithm is used in a variety of applications in bioinformatics, including:</p>
                        <p className="mt-3 max-w-lg ">Comparison of DNA, RNA, and protein sequences.</p>
                        <p>Study of homology and molecular evolution.</p>
                        <p>Analysis of similarity between genes and proteins.</p>
                        <p>Prediction of protein structures and molecular modeling.</p>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <h2 className="mt-10 font-bold text-white text-xl">Conclusion</h2>
                        <p className="mt-3">The Needleman-Wunsch algorithm is an essential tool in biological sequence analysis, enabling the comparison and alignment of sequences to better understand their function and evolution. Its understanding is fundamental to many tasks in bioinformatics and computational biology.</p>
                    </div>
                    <div className="col-span-2 px-10 pt-20">
                        <h1 className="text-center py-10 text-white font-bold text-xl">Links of Interest</h1>
                    </div>
                    <div className="col-span-2 grid sm:grid-cols-2 md:grid-cols-3 gap-3 pt-5 z-3">
                        <a href="https://www.rcsb.org/" target="blank">
                            <div className="group border border-[#0e0e0e] h-auto p-2 col-span-1 hover:border hover:border-gray-500 rounded-lg transition-all cursor-pointer">
                                <h1 className="mt-3 text-white underline group-hover:text-blue-500 transition-all">Protein DataBank</h1>
                                <p className="mt-5 text-sm">The Protein Data Bank (PDB) is a publicly accessible database that provides information about the three-dimensional structure of biological molecules, such as proteins and nucleic acids. It contains experimental data obtained through techniques like X-ray crystallography and nuclear magnetic resonance, allowing researchers to visualize and analyze the structure of proteins and other macromolecules.</p>
                            </div>
                        </a>
                        <a href="https://www.ncbi.nlm.nih.gov/" target="blank">
                            <div className="group border border-[#0e0e0e] h-auto p-2 col-span-1 hover:border hover:border-gray-500 rounded-lg transition-all cursor-pointer">
                                <h1 className="mt-3 text-white underline group-hover:text-blue-500 transition-all">National Library of Medicine (PubMed)</h1>
                                <p className="mt-5 text-sm">The National Library of Medicine (NLM) is a U.S. institution part of the National Institutes of Health (NIH). It houses a vast array of resources and databases related to biomedicine and life sciences. The website provides access to scientific articles, genomic sequence databases, public health information, and much more.</p>
                            </div>
                        </a>
                        <a href="https://genome.ucsc.edu/" target="blank">
                            <div className="group border border-[#0e0e0e] h-auto p-2 col-span-1 hover:border hover:border-gray-500 rounded-lg transition-all cursor-pointer">
                                <h1 className="mt-3 text-white underline group-hover:text-blue-500 transition-all">University of California Santa Cruz - Genome Browser</h1>
                                <p className="mt-5 text-sm">The UCSC Genome Browser is an online tool that allows visualization and analysis of genomes from various species. It provides access to annotated genomic sequences and offers an interactive interface to explore genomic data, including genes, genetic variants, regulatory regions, and more. This tool is widely used by researchers in molecular biology, genetics, and bioinformatics.</p>
                            </div>
                        </a>
                        <a href="https://www.ebi.ac.uk/pdbe/" target="blank">
                            <div className="group border border-[#0e0e0e] h-auto p-2 col-span-1 hover:border hover:border-gray-500 rounded-lg transition-all cursor-pointer">
                                <h1 className="mt-3 text-white underline group-hover:text-blue-500 transition-all">Protein Data Bank Europe (PDBe)</h1>
                                <p className="mt-5 text-sm">A protein database containing structural information about experimentally determined proteins solved by X-ray crystallography, nuclear magnetic resonance, and modeling.</p>
                            </div>
                        </a>
                        <a href="https://www.uniprot.org/" target="blank">
                            <div className="group border border-[#0e0e0e] h-auto p-2 col-span-1 hover:border hover:border-gray-500 rounded-lg transition-all cursor-pointer">
                                <h1 className="mt-3 text-white underline group-hover:text-blue-500 transition-all">UniProt</h1>
                                <p className="mt-5 text-sm">A comprehensive protein database providing access to data on protein function, location, expression, and more.</p>
                            </div>
                        </a>
                        <a href="https://www.ensembl.org/index.html" target="blank">
                            <div className="group border border-[#0e0e0e] h-auto p-2 col-span-1 hover:border hover:border-gray-500 rounded-lg transition-all cursor-pointer">
                                <h1 className="mt-3 text-white underline group-hover:text-blue-500 transition-all">Ensembl</h1>
                                <p className="mt-5 text-sm">A project aimed at providing annotated genomes from various species, with a particular emphasis on vertebrate genomes.</p>
                            </div>
                        </a>
                        <a href="https://www.ebi.ac.uk/interpro/" target="blank">
                            <div className="group border border-[#0e0e0e] h-auto p-2 col-span-1 hover:border hover:border-gray-500 rounded-lg transition-all cursor-pointer">
                                <h1 className="mt-3 text-white underline group-hover:text-blue-500 transition-all">InterPro</h1>
                                <p className="mt-5 text-sm">InterPro is a database that provides integrated protein classifications, grouping proteins into families and predicting domains and binding sites from their sequences. Using various bioinformatics tools and resources, InterPro aids in the functional and structural analysis of proteins, facilitating the understanding of their biological functions and interactions.</p>
                            </div>
                        </a>
                    </div>
                </div>
                <div className="w-full bg-gradient-to-t from-cyan-950 to-[#0e0e0e] h-full px-5 md:px-10 py-5 text-white flex items-center justify-center gap-1 sm:gap-5">
                    <h1 className="text-xs md:text-md">© 2024-2030 RGB Logic - All Rights Reserved</h1>
                    <a className="underline hover:text-blue-500 transition-all" href="https://github.com/sirguilherme97/" target="blank">Github</a>
                </div>
            </div>
        </>
    );
}