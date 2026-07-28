import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Props {
  title: string;
}

export default function UnderConstruction({ title }: Props) {
  return (
    <div className="w-full bg-black min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center text-center px-6 pt-32 pb-20">
        <div>
          <div className="border-l-4 border-yellow-500 pl-6 inline-block text-left mb-10">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white uppercase tracking-tight">{title}</h1>
          </div>
          <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">
            This section is currently being developed as part of our ongoing platform expansion. Check back soon.
          </p>
          <Link href="/" className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-3 font-bold uppercase tracking-widest text-sm transition-colors inline-block">
            Return to Homepage
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
