import { useState, useEffect } from 'react';
import Select from 'react-select';
import { MdCheckCircle, MdError } from 'react-icons/md'; // Importez les icônes de succès et d'erreur
import Modal from '../../Modal/Modal'; // Importez votre composant Modal
import './AreaSettings.scss';

const AreaSettings = () => {
    const baseUrl = import.meta.env.VITE_APP_BASE_URL 
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [numInputs, setNumInputs] = useState(0);
    const [courses, setCourses] = useState([]);
    const [isLoadingCourses, setIsLoadingCourses] = useState(false);
    const [isAllFieldsFilled, setIsAllFieldsFilled] = useState(false);
    const [modalContent, setModalContent] = useState(null);

    const levelOptions = [
        { value: 'L3', label: 'L3' },
        { value: 'M1', label: 'M1' },
    ];

    useEffect(() => {
        if (selectedLevel) {
            fetchCourses(selectedLevel.value);
        }
    }, [selectedLevel]);

    useEffect(() => {
        setIsAllFieldsFilled(selectedLevel && selectedCourse && numInputs > 0 && areAllInputsFilled());
    }, [selectedLevel, selectedCourse, numInputs]);

    const handleLevelChange = (selectedOption) => {
        setSelectedLevel(selectedOption);
        setSelectedCourse(null);
    };

    const handleCourseChange = (selectedOption) => {
        setSelectedCourse(selectedOption);
        setIsAllFieldsFilled(selectedLevel && selectedOption && numInputs > 0 && areAllInputsFilled());
    };

    const fetchCourses = async (selectedLevelValue) => {
        setIsLoadingCourses(true);
        try {
            const response = await fetch(`${baseUrl}/home/get_courses?level=${selectedLevelValue}`);
            const data = await response.json();
            setCourses(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
        setIsLoadingCourses(false);
    };

    const renderInputs = () => {
        const inputs = [];
        for (let i = 0; i < numInputs; i++) {
            inputs.push(
                <input
                    key={i}
                    type="text"
                    placeholder={`Module ${i + 1}`}
                    id={`input-${i}`}
                    onChange={handleInputChange}
                />
            );
        }
        return inputs;
    };

    const areAllInputsFilled = () => {
        for (let i = 0; i < numInputs; i++) {
            const input = document.getElementById(`input-${i}`);
            if (!input || !input.value) {
                return false;
            }
        }
        return true;
    };

    const handleInputChange = () => {
        setIsAllFieldsFilled(selectedLevel && selectedCourse && numInputs > 0 && areAllInputsFilled());
    };

    const handleModifyClick = async () => {
        try {
            const moduleNames = [];
            for (let i = 0; i < numInputs; i++) {
                const input = document.getElementById(`input-${i}`);
                if (input && input.value.trim() !== '') {
                    moduleNames.push(input.value.trim());
                }
            }
            if (moduleNames.length === 0) {
                setModalContent({ icon: <MdError />, message: 'Please enter at least one module name.' });
                return;
            }
            const url = `${baseUrl}/settings/add_update_documents?type=add_update_documents&level=${selectedLevel.value}&course_name=${selectedCourse.value}&module_names=${moduleNames.join(',')}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (response.ok) {
                setModalContent({ icon: <MdCheckCircle size={48} color="green"  />, message: data.message });
            } else {
                setModalContent({ icon: <MdError size={48} color="red" />, message: data.error });
            }
        } catch (error) {
            // Gérer les erreurs de requête
            console.error('Error modifying structure:', error);
            setModalContent({ icon: <MdError />, message: 'An error occurred while modifying structure.' });
        }
    };

    const closeModal = () => {
        setModalContent(null);
    };

    return (
        <div>
            <center><h1 className='h3'>Modify structure</h1></center>
            <div className="containerr">
                <div className="select-wrapperr">
                    <Select
                        value={selectedLevel}
                        onChange={handleLevelChange}
                        options={levelOptions}
                        placeholder="Select level"
                        className="basic-single-select"
                    />
                </div>
                <div className="select-wrapperr">
                    <Select
                        value={selectedCourse}
                        onChange={handleCourseChange}
                        options={courses.map(course => ({ value: course, label: course }))}
                        placeholder={isLoadingCourses ? "Loading..." : "Select course"}
                        className="basic-single-select"
                        isDisabled={isLoadingCourses || !selectedLevel}
                    />
                </div>
                <div className="input-wrapperr">
                    {selectedCourse && (
                        <input
                            type="number"
                            id="numInputs"
                            value={numInputs}
                            onChange={(e) => setNumInputs(e.target.value)}
                            min="0"
                        />
                    )}
                    <div className="inputs-containerr">
                        {selectedCourse && renderInputs()}
                    </div>
                </div>
            </div>
            <div className='btnSave'>
                {isAllFieldsFilled && (
                    <center><button className='modify_btn' onClick={handleModifyClick}>
                        Modify
                    </button></center>
                )}
            </div>
            <Modal open={modalContent !== null} onClose={closeModal}>
            <div className="text-center">
                {modalContent && (
                    <>
                        {modalContent.icon} 
                        <p className="mt-4">{modalContent.message}</p>
                    </>
                )}
                </div>
            </Modal>
        </div>
    );
};

export default AreaSettings;
