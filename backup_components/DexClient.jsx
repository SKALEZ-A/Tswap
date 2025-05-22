import dynamic from 'next/dynamic';
import Dex from './Dex';

// Export a client-side only version of the Dex component
export default dynamic(() => Promise.resolve(Dex), { ssr: false });
