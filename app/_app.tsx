// app/_app.tsx
import '../styles/globals.scss';
import 'react-calendar/dist/Calendar.css';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} />;
}

export default MyApp;
