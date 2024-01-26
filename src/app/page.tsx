'use client'
/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import NeedlemanWunschAlignment from "../components/Script"; // Certifique-se de importar corretamente o componente NeedlemanWunschAlignment

export default function AlignmentContainer() {
    const [seq1, setSeq1] = useState("");
    const [seq2, setSeq2] = useState("");

    const handleSeq1Change = (event:any) => {
        setSeq1(event.target.value);
    };

    const handleSeq2Change = (event:any) => {
        setSeq2(event.target.value);
    };
    return (
        <>
            <div className="w-screen bg-gradient-to-l from-cyan-950 to-black h-screen pt-5 flex flex-col items-center justify-start  text-white">
                <h1 className="text-white font-bold text-lg">Algoritmo de Needleman-Wunsch</h1>
                <h2 className="text-white font-medium text-lg">Alinhamento sequencial</h2>
                <div className="mt-5 flex flex-col gap-4">
                    <input type="text" className="rounded-md min-w-96 h-10  p-2 text-black placeholder:text-black" placeholder="Sequencia 1" value={seq1} onChange={handleSeq1Change} />
                    <input type="text" className="rounded-md min-w-96 h-10  p-2 text-black placeholder:text-black" placeholder="Sequencia 2" value={seq2} onChange={handleSeq2Change} />
                </div>
                <div className="bg-gradient-to-l from-cyan-950 to-black  h-auto pt-20 flex items-start justify-start pb-20">
                    <NeedlemanWunschAlignment seq1={seq1} seq2={seq2} gapPenalty={-1} mismatchPenalty={-1} />
                </div>
                <div className="px-20 py-32 bg-black w-screen h-auto">
                    <h1 className="font-bold text-white">Algoritmo de Needleman-Wunsch: Uma Abordagem Detalhada</h1>
                    <p className="mt-3">O algoritmo de Needleman-Wunsch é uma técnica fundamental na bioinformática, amplamente utilizada para realizar alinhamento global de sequências de DNA, RNA ou proteínas. Desenvolvido por Saul B. Needleman e Christian D. Wunsch em 1970, este algoritmo estabeleceu as bases para muitos outros algoritmos de alinhamento subsequente. Abaixo, apresentamos uma explicação detalhada deste algoritmo, destacando seus principais conceitos e etapas.</p>
                    <h2 className="mt-10 font-bold text-white">Introdução</h2>
                    <p className="mt-3">O algoritmo de Needleman-Wunsch é projetado para encontrar o melhor alinhamento global entre duas sequências, onde "melhor" é definido como o alinhamento que maximiza a similaridade entre as sequências. Ele atribui pontuações para casamentos, mismatches e gaps (lacunas) e calcula o melhor alinhamento possível dentro desses parâmetros.</p>
                    <h2 className="mt-10 font-bold text-white">Etapas do Algoritmo</h2>
                    <p className="mt-3"><span className="font-bold text-white">Inicialização da Matriz de Pontuação: </span> A primeira etapa do algoritmo envolve a criação de uma matriz de pontuação, onde cada célula representa o alinhamento parcial entre as subsequências. A matriz é inicializada com valores baseados nas penalidades para casamentos, mismatches e gaps.</p>
                    <p className="mt-0"><span className="font-bold text-white">Preenchimento da Matriz:</span>A matriz é então preenchida iterativamente. Cada célula é preenchida com o valor máximo obtido considerando os valores das células adjacentes, juntamente com as penalidades por casamento, mismatch e gap. Este preenchimento ocorre em todas as células da matriz.</p>
                    <p className="mt-0"><span className="font-bold text-white">Rastreamento do Caminho Ótimo: </span> Depois que a matriz é preenchida, o próximo passo é rastrear o caminho ótimo através da matriz. Isso é feito retrocedendo da célula final para a célula inicial, seguindo o caminho que maximiza a pontuação total do alinhamento.</p>
                    <p className="mt-0"><span className="font-bold text-white">Construção do Alinhamento:</span> Com o caminho ótimo determinado, o alinhamento final pode ser construído. Isso envolve associar os caracteres das sequências de entrada de acordo com o caminho ótimo, marcando casamentos, mismatches e gaps conforme apropriado.</p>
                    <h2 className="font-bold text-white mt-10">Pontuações e Penalidades</h2>
                    <p className="mt-3"><span className="font-bold text-green-500">Casamento (Match):</span> Pontuação atribuída quando os caracteres nas posições correspondentes das sequências são iguais.</p>
                    <p className="mt-0"><span className="font-bold text-yellow-500">Mismatch (Não Casamento):</span> Penalidade atribuída quando os caracteres nas posições correspondentes das sequências são diferentes.</p>
                    <p className="mt-0"><span className="font-bold text-red-500">Gap (Lacuna):</span> Penalidade atribuída quando um espaço é inserido em uma das sequências para realizar o alinhamento.</p>
                    <h2 className="mt-10 font-bold text-white">Aplicações</h2>
                    <p className="mt-3">O algoritmo de Needleman-Wunsch é utilizado em uma variedade de aplicações na bioinformática, incluindo:</p>
                    <p className="mt-3">Comparação de sequências de DNA, RNA e proteínas.</p>
                    <p>Estudo de homologia e evolução molecular.</p>
                    <p>Análise de similaridade entre genes e proteínas.</p>
                    <p>Predição de estruturas de proteínas e modelagem molecular.</p>
                    <h2 className="mt-10 font-bold text-white">Conclusão</h2>
                    <p className="mt-3">O algoritmo de Needleman-Wunsch é uma ferramenta essencial na análise de sequências biológicas, permitindo a comparação e alinhamento de sequências para entender melhor sua função e evolução. Sua compreensão é fundamental para muitas tarefas na bioinformática e biologia computacional.</p>
                    <h1 className="mt-20 text-white font-bold text-xl">Links de Interesse</h1>
                    <div className="grid grid-cols-3 gap-3 pt-5">
                        <a href="https://www.rcsb.org/" target="blank">
                            <div className="group border border-black h-auto p-2 col-span-1 hover:border hover:border-gray-500 rounded-lg transition-all cursor-pointer">
                                <h1 className="mt-3 text-white underline group-hover:text-blue-500 transition-all">Protein DataBase</h1>
                                <p className="mt-5 text-sm">O Protein Data Bank (PDB) é um banco de dados de acesso público que fornece informações sobre a estrutura tridimensional de moléculas biológicas, como proteínas e ácidos nucleicos. Ele contém dados experimentais obtidos por técnicas como cristalografia de raios X e ressonância magnética nuclear, permitindo que pesquisadores visualizem e analisem a estrutura de proteínas e outros macromoléculas.</p>
                            </div>
                        </a>
                        <a href="https://www.ncbi.nlm.nih.gov/" target="blank">
                            <div className="group border border-black h-auto p-2 col-span-1 hover:border hover:border-gray-500 rounded-lg transition-all cursor-pointer">
                                <h1 className="mt-3 text-white underline group-hover:text-blue-500 transition-all">National Library of Medicine (PubMed)</h1>
                                <p className="text-sm">A National Library of Medicine (NLM) é uma instituição dos Estados Unidos que faz parte dos Institutos Nacionais de Saúde (NIH). Ela abriga uma vasta quantidade de recursos e bases de dados relacionados à biomedicina e ciências da vida. O site oferece acesso a artigos científicos, bancos de dados de sequências genômicas, informações sobre saúde pública e muito mais.</p>
                            </div>
                        </a>
                        <a href="https://genome.ucsc.edu/" target="blank">
                            <div className="group border border-black h-auto p-2 col-span-1 hover:border hover:border-gray-500 rounded-lg transition-all cursor-pointer">
                                <h1 className="mt-3 text-white underline group-hover:text-blue-500 transition-all">University of California Santa Cruz - Genome Browser</h1>
                                <p className="text-sm">O Genome Browser da Universidade da Califórnia em Santa Cruz (UCSC) é uma ferramenta online que permite a visualização e análise de genomas de várias espécies. Ele oferece acesso a sequências genômicas anotadas e fornece uma interface interativa para explorar dados genômicos, incluindo genes, variantes genéticas, regiões regulatórias e muito mais. Essa ferramenta é amplamente utilizada por pesquisadores em biologia molecular, genética e bioinformática.</p>
                            </div>
                        </a>
                        <a href="https://www.ebi.ac.uk/pdbe/" target="blank">
                            <div className="group border border-black h-auto p-2 col-span-1 hover:border hover:border-gray-500 rounded-lg transition-all cursor-pointer">
                                <h1 className="mt-3 text-white underline group-hover:text-blue-500 transition-all">Protein Data Bank Europe (PDBe)</h1>
                                <p className="text-sm">Banco de dados de proteínas que contém informações estruturais sobre proteínas experimentais resolvidas por cristalografia de raios X, ressonância magnética nuclear e modelagem.</p>
                            </div>
                        </a>
                        <a href="https://www.uniprot.org/" target="blank">
                            <div className="group border border-black h-auto p-2 col-span-1 hover:border hover:border-gray-500 rounded-lg transition-all cursor-pointer">
                                <h1 className="mt-3 text-white underline group-hover:text-blue-500 transition-all">UniProt</h1>
                                <p className="text-sm">Uma base de dados abrangente de proteínas e informações funcionais, que fornece acesso a dados sobre a função de proteínas, sua localização, expressão e muito mais.</p>
                            </div>
                        </a>
                        <a href="https://www.ensembl.org/index.html" target="blank">
                            <div className="group border border-black h-auto p-2 col-span-1 hover:border hover:border-gray-500 rounded-lg transition-all cursor-pointer">
                                <h1 className="mt-3 text-white underline group-hover:text-blue-500 transition-all">Ensembl</h1>
                                <p className="text-sm">Um projeto que visa fornecer genomas anotados de várias espécies, com uma ênfase particular em genomas de vertebrados.</p>
                            </div>
                        </a>
                        <a href="https://www.ebi.ac.uk/interpro/" target="blank">
                            <div className="group border border-black h-auto p-2 col-span-1 hover:border hover:border-gray-500 rounded-lg transition-all cursor-pointer">
                                <h1 className="mt-3 text-white underline group-hover:text-blue-500 transition-all">InterPro</h1>
                                <p className="text-sm">InterPro é uma base de dados que fornece classificações integradas de proteínas, agrupando proteínas em famílias e predizendo domínios e sítios de ligação a partir de suas sequências. Utilizando várias ferramentas e recursos de bioinformática, InterPro ajuda na análise funcional e estrutural de proteínas, facilitando a compreensão de suas funções biológicas e interações.</p>
                            </div>
                        </a>
                    </div>
                </div>
                <div className="w-full bg-gradient-to-t from-cyan-950 to-black h-full px-10 py-5 text-white flex items-center justify-center gap-5">
                    <h1>© 2024-2030 RGB Logic - Todos os Direitos reservados</h1>
                    <a className="underline hover:text-blue-500 transition-all" href="https://github.com/sirguilherme97/" target="blank">Github</a>
                </div>
            </div>
        </>
    );
}
