import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import Modal from '../../Modal/Modal';
import { MdCheckCircle, MdError } from 'react-icons/md';
import AnimationSetting from '../../../utils/animation/Animation_setting';
import './Areaactivate.scss'

const Areaactivate = () => {
    const baseUrl = import.meta.env.VITE_APP_BASE_URL
    const [toggleStatesL3, setToggleStatesL3] = useState({});
    const [toggleStatesM1, setToggleStatesM1] = useState({});
    const [loading, setLoading] = useState(true);
    const [initialToggleStatesL3, setInitialToggleStatesL3] = useState({});
    const [initialToggleStatesM1, setInitialToggleStatesM1] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState('success');
    const [modalContent, setModalContent] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const responseL3 = await axios.get(`${baseUrl}/settings/courses_status?level=L3`);
                const coursesDataL3 = responseL3.data;
                const togglesL3 = {};
                coursesDataL3.forEach(course => {
                    togglesL3[course.name] = course.status;
                });
                setToggleStatesL3(togglesL3);
                setInitialToggleStatesL3(togglesL3);

                const responseM1 = await axios.get(`${baseUrl}/settings/courses_status?level=M1`);
                const coursesDataM1 = responseM1.data;
                const togglesM1 = {};
                coursesDataM1.forEach(course => {
                    togglesM1[course.name] = course.status;
                });
                setToggleStatesM1(togglesM1);
                setInitialToggleStatesM1(togglesM1);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
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

    const handleToggle = (name, level) => {
        if (level === 'L3') {
            setToggleStatesL3({ ...toggleStatesL3, [name]: !toggleStatesL3[name] });
        } else if (level === 'M1') {
            setToggleStatesM1({ ...toggleStatesM1, [name]: !toggleStatesM1[name] });
        }
    };

    const handleSubmit = async () => {
        try {
            const modifiedCoursesL3 = [];
            const modifiedCoursesM1 = [];

            Object.entries(toggleStatesL3).forEach(([name, status]) => {
                if (status !== initialToggleStatesL3[name]) {
                    modifiedCoursesL3.push({ name, status });
                }
            });

            Object.entries(toggleStatesM1).forEach(([name, status]) => {
                if (status !== initialToggleStatesM1[name]) {
                    modifiedCoursesM1.push({ name, status });
                }
            });

            if (modifiedCoursesL3.length > 0) {
                await axios.post(`${baseUrl}/settings/update_course_status`, { level: 'L3', courses: modifiedCoursesL3 });
            }
            if (modifiedCoursesM1.length > 0) {
                await axios.post(`${baseUrl}/settings/update_course_status`, { level: 'M1', courses: modifiedCoursesM1 });
            }
            setModalType('success');
            setModalContent('Changes saved successfully!');
            setModalOpen(true);
        } catch (error) {
            console.error('Error updating course states:', error);
            setModalType('error');
            setModalContent('An error occurred while saving changes.');
            setModalOpen(true);
        }
    };

    if (loading) {
        return <AnimationSetting/>;
    }

    return (
        <div className='process-containeer'>
            <div className="container-fluid">
                <h1 className="text-center mb-4 alltxt">Activate course:</h1>
                <div className="row">
                    <div className="col-6 d-flex justify-content-center">
                        <div>
                            <h2 className="alltxt">L3</h2>
                            {Object.entries(toggleStatesL3).map(([name, status]) => (
                                <ToggleSwitch
                                    key={name}
                                    id={name}
                                    name={name}
                                    checked={status}
                                    onChange={() => handleToggle(name, 'L3')}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="col-6 d-flex justify-content-center">
                        <div>
                            <h2 className="text-center alltxt">M1</h2>
                            {Object.entries(toggleStatesM1).map(([name, status]) => (
                                <ToggleSwitch
                                    key={name}
                                    id={name}
                                    name={name}
                                    checked={status}
                                    onChange={() => handleToggle(name, 'M1')}
                                />
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

export default Areaactivate;
