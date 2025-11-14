import { useState } from "react";
import "./AerialUnitSelection.css";




export default function AerialUnitSelection(){
    const [isImgSelctionOpen, setIsImgSelctionOpen] = useState(false);
    const [selectedAerialUnit, setSelectedAerialUnit] = useState<string | null>(null);

    const options = [
        { value: "plane", img: "/Images/AerialUnitsImages/ImgPlane.png" },
        { value: "drone", img: "/Images/AerialUnitsImages/ImgDrone.png" },
        { value: "balloon", img: "/Images/AerialUnitsImages/ImgBalloon.png" },
        
        { value: "b2spirit", img: "/Images/AerialUnitsImages/b2spirit.png" },
        { value: "f16", img: "/Images/AerialUnitsImages/f16.png" },
        { value: "f34", img: "/Images/AerialUnitsImages/f34.png" },
        { value: "IAIKfir", img: "/Images/AerialUnitsImages/IAIKfir.png" },
        { value: "UAV", img: "/Images/AerialUnitsImages/UAV.png" },
    ];

    return(
        <div>
            <label
            style={{fontSize: 20}}>AerialUnit type: {selectedAerialUnit ? selectedAerialUnit : "Not choosed"}</label>
            <button 
            className="changeType-button"
            onClick={() => setIsImgSelctionOpen(!isImgSelctionOpen)}
            >
            Change AerialUnit Type
            </button>

            {isImgSelctionOpen && (
            <div>
                {options.map((opt) => (
                    
                    <div key={opt.value} style={{ display: "inline-block", textAlign: "center", margin: "4px" }}>
                    <label style={{ display: "block", fontSize: "12px" }}>{opt.value}</label>
                    <img
                        className= {opt.value === selectedAerialUnit ? "selected-image-option" : "image-option"}
                        src={opt.img}
                        width={70}
                        height={70}
                        onClick={() => {
                        setSelectedAerialUnit(opt.value);
                        //setIsImgSelctionOpen(false);
                        }}
                    />
                    </div>
                ))}
            </div>
            )}
        </div>

    );
}