import { Star } from "lucide-react";

export function Footer() {

    return (
        <footer className="w-full bg-gray-900 text-gray-400 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-white mb-4">
                            <Star className="w-6 h-6 text-blue-500" fill="currentColor" />
                            <span>InfluencerInsight</span>
                        </div>
                        <p className="text-sm">
                            Empowering PR professionals with transparent influencer reviews.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white mb-4">Product</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white mb-4">Company</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Guidelines</a></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-800 pt-8 text-sm text-center">
                    © 2024 InfluencerInsight. All rights reserved.
                </div>
            </div>
      </footer >
    )
}