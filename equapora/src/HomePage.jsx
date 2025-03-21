import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import "./HomePage.css";
import * as THREE from "three";
import FOG from "vanta/dist/vanta.fog.min";

const HomePage = () => {
    const [vantaEffect, setVantaEffect] = useState(null);
    const myRef = React.useRef(null);
    const navigate = useNavigate();

    const goToApp = () => {
        navigate('/app');
    };

    useEffect(() => {
        if (!vantaEffect) {
            setVantaEffect(FOG({
                el: myRef.current, // use the correct ref herebwdnkdwnkkn
                THREE: THREE,
                highlightColor: 0x0077be,
                midtoneColor: 0x005f99,
                lowlightColor: 0x003f66,
                baseColor: 0x001f33,
                blurFactor: 0.6,
                speed: 1.2,
            }));
        }
        // Cleanup effect when the component is unmounted
        return () => {
            if (vantaEffect) vantaEffect.destroy();
        };
    }, [vantaEffect]);

    return (
        <div ref={myRef} className="homepage-container">
            <h1 className="heading">EvapoRa</h1>
            <div className="scroll-section">
                <div>
                    <h2 className="heading">What is EvapoRa?</h2>
                    <p>
                    EvapoRa is an initiative focused on reducing water loss
                        through innovative solutions. Our goal is to conserve water
                        resources for future generations by implementing sustainable methods.
                    </p>
                </div>
            </div>

            <div className="scroll-section">
                <div>
                    <h2 className="heading">Why Reduce Water Evaporation?</h2>
                    <p>
                    Water evaporation leads to a substantial loss of valuable freshwater resources, which are critical for agriculture, drinking, and sustaining ecosystems. As global water scarcity becomes an increasing concern, it's essential to find ways to conserve every drop.By using modern techniques like mulching, water covers, and innovative storage methods, we can significantly reduce evaporation rates. These methods not only help preserve water but also ensure that more freshwater is available for future generations, making a positive impact on food security, livelihoods, and environmental sustainability.
                    </p>
                </div>
            </div>

            <div className="scroll-section">
                <div>
                    <h2 className="heading">Ways to Reduce Water Evaporation</h2>
                    <ul>
                        <li>Use shade structures over water bodies</li>
                        <li>Implement floating covers for reservoirs</li>
                        <li>Apply mulch to soil surfaces</li>
                        <li>Use windbreaks to reduce water loss</li>
                        <li>Adopt drip irrigation methods</li>
                    </ul>
                </div>
            </div>
            <button onClick={goToApp}>Check your Water Loss</button>
        </div>
    );
};

export default HomePage;
