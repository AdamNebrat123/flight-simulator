import { useState } from "react";
import "./AerialUnitSelection.css";
import { AircraftTypeEnum } from "../Messages/AircraftTypeEnum";

interface AerialUnitSelectionProps {
    selectedType: string | null;                  // סוג נבחר כרגע
    onSelectType: (type: string) => void;         // פונקציה לעדכון בחירה
}


export default function AerialUnitSelection({ selectedType, onSelectType }: AerialUnitSelectionProps){
    const [isImgSelctionOpen, setIsImgSelctionOpen] = useState(false);

    const options = [
        { value: AircraftTypeEnum.Plane , img: "/Images/AerialUnitsImages/ImgPlane.png" },
        { value: AircraftTypeEnum.Drone, img: "/Images/AerialUnitsImages/ImgDrone.png" },
        { value: AircraftTypeEnum.Balloon, img: "/Images/AerialUnitsImages/ImgBalloon.png" },
        { value: AircraftTypeEnum.B2spirit, img: "/Images/AerialUnitsImages/b2spirit.png" },
        { value: AircraftTypeEnum.F16, img: "/Images/AerialUnitsImages/f16.png" },
        { value: AircraftTypeEnum.F35, img: "/Images/AerialUnitsImages/f34.png" },
        { value: AircraftTypeEnum.IaiKfir, img: "/Images/AerialUnitsImages/IAIKfir.png" },
        { value: AircraftTypeEnum.Uav, img: "/Images/AerialUnitsImages/UAV.png" },
    ];

    return(
        <div>
            <label style={{fontSize: 20}}>
                AerialUnit type: {selectedType ? selectedType : "Not choosed"}
            </label>
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
                                className={opt.value === selectedType ? "selected-image-option" : "image-option"}
                                src={opt.img}
                                width={70}
                                height={70}
                                onClick={() => onSelectType(opt.value)} // <-- כאן שולחים החוצה את הבחירה
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}