"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@radix-ui/themes";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
  

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Your Voice Matters
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Submit complaints, track their progress, and help improve public
            services in your community.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
           
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Link href="/issues/list">
                <Button variant="soft" size="3" className="w-full">
                  Track Complaints
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-lg text-gray-500">
              Simple steps to make your voice heard
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="text-blue-600 text-2xl font-bold mb-4">1</div>
              <h3 className="text-lg font-medium text-gray-900">
                Submit Your Complaint
              </h3>
              <p className="mt-2 text-gray-500">
                Fill out a simple form with details about your issue or
                feedback.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="text-blue-600 text-2xl font-bold mb-4">2</div>
              <h3 className="text-lg font-medium text-gray-900">
                Track Progress
              </h3>
              <p className="mt-2 text-gray-500">
                Monitor the status of your complaint and receive updates in
                real-time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="text-blue-600 text-2xl font-bold mb-4">3</div>
              <h3 className="text-lg font-medium text-gray-900">
                Get Resolution
              </h3>
              <p className="mt-2 text-gray-500">
                Receive responses from relevant agencies and track the
                resolution process.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500 text-sm">
            © 2024 CitizenConnect. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
