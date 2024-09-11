"use client";

import Link from "next/link";
import type { NextPage } from "next";
import Typewriter from "typewriter-effect";
import { ShoppingCartIcon, WalletIcon } from "@heroicons/react/24/outline";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col flex-grow bg-gray-100 min-h-screen">
        <div className="relative w-full bg-gradient-to-b from-blue-500 to-purple-600 text-white py-20">
          <div className="container mx-auto flex flex-col items-center text-center px-5">
            <h1 className="text-6xl font-bold mb-4">Welcome to DeWorld</h1>
            <p className="text-xl mb-6 max-w-2xl">
              Experience secure, transparent, and decentralized transactions with gasless interactions powered by zkSync.
              Safeguard your transactions with escrow protection and decentralized arbitration for all your online marketplace needs.
            </p>
            <span className="text-3xl font-semibold mb-8">
              <Typewriter
                options={{
                  strings: [
                    "Gasless Transactions with zkSync",
                    "Decentralized Escrow for Safety",
                    "Explore Trustworthy Marketplaces",
                  ],
                  autoStart: true,
                  loop: true,
                }}
              />
            </span>
            <div className="flex justify-center gap-6 mt-8">
              <Link href="/stores" className="btn btn-primary text-lg px-8 py-4 rounded-full bg-green-500 hover:bg-green-700">
                Explore Marketplaces
              </Link>
              <RainbowKitCustomConnectButton />
            </div>
          </div>
          <img src="/planet-deworld.png" alt="planet" className="absolute left-0 bottom-0 w-1/3 opacity-50" />
        </div>

        <section className="w-full bg-white py-20">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6 text-blue-600">Why Choose DeWorld?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
              <div className="bg-gray-100 p-8 rounded-lg shadow-lg">
                <WalletIcon className="h-12 w-12 mx-auto text-blue-600 mb-4" />
                <h3 className="text-2xl font-semibold mb-3">Gasless Transactions</h3>
                <p>Experience seamless, fee-free transactions with our zkSync integration, eliminating the need for gas fees.</p>
              </div>
              <div className="bg-gray-100 p-8 rounded-lg shadow-lg">
                <ShoppingCartIcon className="h-12 w-12 mx-auto text-blue-600 mb-4" />
                <h3 className="text-2xl font-semibold mb-3">Escrow Protection</h3>
                <p>Secure your transactions with smart contract-based escrow that ensures funds are only released when all conditions are met.</p>
              </div>
              <div className="bg-gray-100 p-8 rounded-lg shadow-lg">
                <img src="/arbitration-icon.png" alt="Arbitration" className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-3">Decentralized Arbitration</h3>
                <p>Enjoy peace of mind with independent arbitrators resolving disputes fairly and transparently using predefined rules.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full bg-blue-50 py-20">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold text-purple-700 mb-6">Get Started with DeWorld</h2>
            <p className="text-lg max-w-3xl mx-auto mb-12">
              Join DeWorld today and start exploring decentralized marketplaces with zero gas fees, secure escrow, and reliable dispute resolution.
            </p>
            <div className="flex justify-center gap-6">
              <Link href="/stores" className="btn btn-outline btn-primary px-8 py-4 rounded-full">
                Browse Marketplaces
              </Link>
              <Link href="/about" className="btn btn-secondary px-8 py-4 rounded-full">
                Learn More
              </Link>
            </div>
          </div>
        </section>

        <footer className="w-full bg-gray-900 text-white py-10">
          <div className="container mx-auto text-center">
            <p className="text-sm">&copy; {new Date().getFullYear()} DeWorld. All rights reserved.</p>
            <div className="mt-4">
              <Link href="/privacy-policy" className="text-blue-400 hover:text-blue-600 mx-4">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-blue-400 hover:text-blue-600 mx-4">
                Terms of Service
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Home;
