import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import QuickServices from '../components/QuickServices';
import Process from '../components/Process';
import FAQItem from '../components/FAQItem';
import Footer from '../components/Footer';

function Home(){
    return (
        <>
          <Navbar/>
          <Hero/>
          <QuickServices/>
          <Process/>
          <FAQItem/>
          <Footer/>
        </>
    )
}
export default Home;