import React from 'react'
import Link from 'next/link'
import Logo from '../favicon.ico'
import Image from 'next/image'
export const metadata = {
  title: 'Links of Interest | Needleman-Wunsch Algorithm',
  description: 'Useful resources and links for bioinformatics and sequence alignment research.'
}

export default function LinksPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-gradient-to-l from-cyan-950 to-black">
      <div className="w-full max-w-7xl mx-auto">
        <div className="pt-10 px-5">
          <Link href="/" className="font-bold text-gray-100 transition-all">
            ← Back
          </Link>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-center text-3xl font-bold my-8 text-white">Links of Interest</h1>
            <Image src={Logo} alt="Logo" width={40} height={40} className=""/>
          </div>
        </div>

        <div className="text-[#ededed] cursor-default w-full h-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 p-5 z-3">
            <a href="https://www.rcsb.org/" target="blank" className="h-full">
              <div className="group border border-black/0 h-full p-2 col-span-1 hover:border hover:border-gray-500 rounded-lg transition-all cursor-pointer flex flex-col">
                <h1 className="mt-3 text-white underline group-hover:text-blue-500 transition-all">Protein DataBank</h1>
                <p className="mt-5 text-sm flex-grow">The Protein Data Bank (PDB) is a publicly accessible database that provides information about the three-dimensional structure of biological molecules, such as proteins and nucleic acids. It contains experimental data obtained through techniques like X-ray crystallography and nuclear magnetic resonance, allowing researchers to visualize and analyze the structure of proteins and other macromolecules.</p>
              </div>
            </a>
            <a href="https://www.ncbi.nlm.nih.gov/" target="blank" className="h-full">
              <div className="group border border-black/0 h-full p-2 col-span-1 hover:border hover:border-gray-500 rounded-lg transition-all cursor-pointer flex flex-col">
                <h1 className="mt-3 text-white underline group-hover:text-blue-500 transition-all">National Library of Medicine (PubMed)</h1>
                <p className="mt-5 text-sm flex-grow">The National Library of Medicine (NLM) is a U.S. institution part of the National Institutes of Health (NIH). It houses a vast array of resources and databases related to biomedicine and life sciences. The website provides access to scientific articles, genomic sequence databases, public health information, and much more.</p>
              </div>
            </a>
            <a href="https://genome.ucsc.edu/" target="blank" className="h-full">
              <div className="group border border-black/0 h-full p-2 col-span-1 hover:border hover:border-gray-500 rounded-lg transition-all cursor-pointer flex flex-col">
                <h1 className="mt-3 text-white underline group-hover:text-blue-500 transition-all">University of California Santa Cruz - Genome Browser</h1>
                <p className="mt-5 text-sm flex-grow">The UCSC Genome Browser is an online tool that allows visualization and analysis of genomes from various species. It provides access to annotated genomic sequences and offers an interactive interface to explore genomic data, including genes, genetic variants, regulatory regions, and more. This tool is widely used by researchers in molecular biology, genetics, and bioinformatics.</p>
              </div>
            </a>
            <a href="https://www.ebi.ac.uk/pdbe/" target="blank" className="h-full">
              <div className="group border border-black/0 h-full p-2 col-span-1 hover:border hover:border-gray-500 rounded-lg transition-all cursor-pointer flex flex-col">
                <h1 className="mt-3 text-white underline group-hover:text-blue-500 transition-all">Protein Data Bank Europe (PDBe)</h1>
                <p className="mt-5 text-sm flex-grow">A protein database containing structural information about experimentally determined proteins solved by X-ray crystallography, nuclear magnetic resonance, and modeling.</p>
              </div>
            </a>
            <a href="https://www.uniprot.org/" target="blank" className="h-full">
              <div className="group border border-black/0 h-full p-2 col-span-1 hover:border hover:border-gray-500 rounded-lg transition-all cursor-pointer flex flex-col">
                <h1 className="mt-3 text-white underline group-hover:text-blue-500 transition-all">UniProt</h1>
                <p className="mt-5 text-sm flex-grow">A comprehensive protein database providing access to data on protein function, location, expression, and more.</p>
              </div>
            </a>
            <a href="https://www.ensembl.org/index.html" target="blank" className="h-full">
              <div className="group border border-black/0 h-full p-2 col-span-1 hover:border hover:border-gray-500 rounded-lg transition-all cursor-pointer flex flex-col">
                <h1 className="mt-3 text-white underline group-hover:text-blue-500 transition-all">Ensembl</h1>
                <p className="mt-5 text-sm flex-grow">A project aimed at providing annotated genomes from various species, with a particular emphasis on vertebrate genomes.</p>
              </div>
            </a>
            <a href="https://www.ebi.ac.uk/interpro/" target="blank" className="h-full">
              <div className="group border border-black/0 h-full p-2 col-span-1 hover:border hover:border-gray-500 rounded-lg transition-all cursor-pointer flex flex-col">
                <h1 className="mt-3 text-white underline group-hover:text-blue-500 transition-all">InterPro</h1>
                <p className="mt-5 text-sm flex-grow">InterPro is a database that provides integrated protein classifications, grouping proteins into families and predicting domains and binding sites from their sequences. Using various bioinformatics tools and resources, InterPro aids in the functional and structural analysis of proteins, facilitating the understanding of their biological functions and interactions.</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      <div className="w-full bg-black/0 h-[100px] px-5 md:px-10 py-5 text-white flex items-center justify-center gap-1 sm:gap-5 mt-10">
        <h1 className="text-xs md:text-md">© 2024-2030 RGB Logic - All Rights Reserved</h1>
        <a className="underline hover:text-blue-500 transition-all" href="https://github.com/sirguilherme97/" target="blank">Github</a>
      </div>
    </main>
  )
} 