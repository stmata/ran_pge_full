import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import Modal from '../../Modal/Modal';
import { MdCheckCircle, MdError } from 'react-icons/md';
import AnimationSetting from '../../../utils/animation/Animation_setting';

const AreaEvaluation = () => {
    const baseUrl = import.meta.env.VITE_APP_BASE_URL;
    const [toggleStatesQCML3, setToggleStatesQCML3] = useState({});
    const [toggleStatesOuverteL3, setToggleStatesOuverteL3] = useState({});
    const [toggleStatesQCMM1, setToggleStatesQCMM1] = useState({});
    const [toggleStatesOuverteM1, setToggleStatesOuverteM1] = useState({});
    const [loading, setLoading] = useState(true);
    const [initialToggleStatesQCML3, setInitialToggleStatesQCML3] = useState({});
    const [initialToggleStatesQCMM1, setInitialToggleStatesQCMM1] = useState({});
    const [initialToggleStatesOuverteL3, setInitialToggleStatesOuverteL3] = useState({});
    const [initialToggleStatesOuverteM1, setInitialToggleStatesOuverteM1] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState('success');
    const [modalContent, setModalContent] = useState('');


    const fetchData = async () => {
        try {
            const responseL3 = await axios.get(`${baseUrl}/settings/courses_status?level=L3`);
            const coursesDataL3 = responseL3.data;
            const togglesQCML3 = {};
            const togglesOuverteL3 = {};

            await Promise.all(coursesDataL3.map(async (course) => {
                const coursName = course.name;
                const responseQCM = await axios.get(`${baseUrl}/checkstatusofdatafram/${coursName}/L3/QCM`);
                togglesQCML3[coursName] = responseQCM.data.status;
                const responseOuverte = await axios.get(`${baseUrl}/checkstatusofdatafram/${coursName}/L3/Ouverte`);
                togglesOuverteL3[coursName] = responseOuverte.data.status;
            }));

            setToggleStatesQCML3(togglesQCML3);
            setInitialToggleStatesQCML3(togglesQCML3);
            setToggleStatesOuverteL3(togglesOuverteL3);
            setInitialToggleStatesOuverteL3(togglesOuverteL3);

            const responseM1 = await axios.get(`${baseUrl}/settings/courses_status?level=M1`);
            const coursesDataM1 = responseM1.data;
            const togglesQCMM1 = {};
            const togglesOuverteM1 = {};

            await Promise.all(coursesDataM1.map(async (course) => {
                const coursName = course.name;
                const responseQCM = await axios.get(`${baseUrl}/checkstatusofdatafram/${coursName}/M1/QCM`);
                togglesQCMM1[coursName] = responseQCM.data.status;
                const responseOuverte = await axios.get(`${baseUrl}/checkstatusofdatafram/${coursName}/M1/Ouverte`);
                togglesOuverteM1[coursName] = responseOuverte.data.status;
            }));

            setToggleStatesQCMM1(togglesQCMM1);
            setInitialToggleStatesQCMM1(togglesQCMM1);
            setToggleStatesOuverteM1(togglesOuverteM1);
            setInitialToggleStatesOuverteM1(togglesOuverteM1);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const ToggleSwitch = ({ id, name, checked, onChange }) => (
        <div className="form-check form-switch">
            <input
                className="form-check-input"
                type="checkbox"
                id={id}
                checked={checked}
                onChange={onChange}
            />
            <label className="form-check-label alltxt" htmlFor={id}>
                {name}
            </label>
        </div>
    );

    const handleToggle = (courseName, level, evaluationType) => {
        if (level === 'L3') {
            if (evaluationType === 'QCM') {
                setToggleStatesQCML3({
                    ...toggleStatesQCML3,
                    [courseName]: !toggleStatesQCML3[courseName],
                });
            } else if (evaluationType === 'Ouverte') {
                setToggleStatesOuverteL3({
                    ...toggleStatesOuverteL3,
                    [courseName]: !toggleStatesOuverteL3[courseName],
                });
            }
        } else if (level === 'M1') {
            if (evaluationType === 'QCM') {
                setToggleStatesQCMM1({
                    ...toggleStatesQCMM1,
                    [courseName]: !toggleStatesQCMM1[courseName],
                });
            } else if (evaluationType === 'Ouverte') {
                setToggleStatesOuverteM1({
                    ...toggleStatesOuverteM1,
                    [courseName]: !toggleStatesOuverteM1[courseName],
                });
            }
        }
    };

    const handleSubmit = async () => {
        const updateMessages = [];
        try {
            const updates = [];
    
            // Collect updates for L3/QCM
            Object.entries(toggleStatesQCML3).forEach(([courseName, status]) => {
                if (status !== initialToggleStatesQCML3[courseName]) {
                    updates.push({
                        course: courseName,
                        level: 'L3',
                        evaluation_type: 'QCM',
                        status,
                    });
                }
            });
    
            // Collect updates for L3/Ouverte
            Object.entries(toggleStatesOuverteL3).forEach(([courseName, status]) => {
                if (status !== initialToggleStatesOuverteL3[courseName]) {
                    updates.push({
                        course: courseName,
                        level: 'L3',
                        evaluation_type: 'Ouverte',
                        status,
                    });
                }
            });
    
            // Collect updates for M1/QCM
            Object.entries(toggleStatesQCMM1).forEach(([courseName, status]) => {
                if (status !== initialToggleStatesQCMM1[courseName]) {
                    updates.push({
                        course: courseName,
                        level: 'M1',
                        evaluation_type: 'QCM',
                        status,
                    });
                }
            });
    
            // Collect updates for M1/Ouverte
            Object.entries(toggleStatesOuverteM1).forEach(([courseName, status]) => {
                if (status !== initialToggleStatesOuverteM1[courseName]) {
                    updates.push({
                        course: courseName,
                        level: 'M1',
                        evaluation_type: 'Ouverte',
                        status,
                    });
                }
            });
    
            // Send all updates
            /*const promises = updates.map(update =>
                axios.put(`${baseUrl}/addorupdatestatusofdatafram/${update.course}/${update.level}/${update.evaluation_type}`, {
                    status: update.status,
                })
            );*/

            const promises = updates.map(update =>
                axios.put(`${baseUrl}/addorupdatestatusofdatafram/${update.course}/${update.level}/${update.evaluation_type}`, {
                    status: update.status,
                })
                .then(response => {
                    updateMessages.push(`➟ ${update.course}=> ${update.evaluation_type} ✅.\n`);
                })
                .catch(error => {
                    updateMessages.push(`➟ ${update.course}=> ${update.evaluation_type} ❌.\n`);
                })
            );
    
            await Promise.all(promises);
            setModalType('success');
            setModalContent(updateMessages.map(msg => `${msg}`));
            setModalOpen(true);
            await fetchData();
        } catch (error) {
            console.error('Error updating course statuses:', error);
            setModalType('error');
            setModalContent('An error occurred while saving changes.');
            setModalOpen(true);
        }
    };
    

    if (loading) {
        return <AnimationSetting />;
    }

    return (
        <div className='process-containeer'>
            <div className="container-fluid">
                <h1 className="text-center mb-4 alltxt">State of Datafram</h1>
                <div className="row">
                    <div className="col-6 d-flex justify-content-center">
                        <div>
                            <h2 className="alltxt">L3</h2>
                            {Object.keys(toggleStatesQCML3).map((courseName) => (
                                <div key={courseName}>
                                    <h3 className="alltxt">{courseName}</h3>
                                    <ToggleSwitch
                                        id={`${courseName}-L3-QCM`}
                                        name="QCM"
                                        checked={toggleStatesQCML3[courseName]}
                                        onChange={() => handleToggle(courseName, 'L3', 'QCM')}
                                    />
                                    <ToggleSwitch
                                        id={`${courseName}-L3-Ouverte`}
                                        name="Ouverte"
                                        checked={toggleStatesOuverteL3[courseName]}
                                        onChange={() => handleToggle(courseName, 'L3', 'Ouverte')}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="col-6 d-flex justify-content-center">
                        <div>
                            <h2 className="alltxt">M1</h2>
                            {Object.keys(toggleStatesQCMM1).map((courseName) => (
                                <div key={courseName}>
                                    <h3 className="alltxt">{courseName}</h3>
                                    <ToggleSwitch
                                        id={`${courseName}-M1-QCM`}
                                        name="QCM"
                                        checked={toggleStatesQCMM1[courseName]}
                                        onChange={() => handleToggle(courseName, 'M1', 'QCM')}
                                    />
                                    <ToggleSwitch
                                        id={`${courseName}-M1-Ouverte`}
                                        name="Ouverte"
                                        checked={toggleStatesOuverteM1[courseName]}
                                        onChange={() => handleToggle(courseName, 'M1', 'Ouverte')}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="col-12 d-flex justify-content-center">
                        <button className="btn btn-primary mt-3 alltxt" onClick={handleSubmit}>
                            Valider
                        </button>
                    </div>
                </div>
            </div>
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <div className="text-center">
                    {modalType === 'success' ? (
                        <MdCheckCircle size={48} color="green" />
                    ) : (
                        <MdError size={48} color="red" />
                    )}
                    <p className="mt-4">{modalContent}</p>
                </div>
            </Modal>
        </div>
    );
};

export default AreaEvaluation;
