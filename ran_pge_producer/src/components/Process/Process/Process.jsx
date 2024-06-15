import { useState, useEffect } from 'react';
import Select from 'react-select';
import './Process.scss';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import Modal from '../../Modal/Modal';
import { MdCheckCircle, MdWarning, MdError } from 'react-icons/md';

const Process = () => {
    const baseUrl = import.meta.env.VITE_APP_BASE_URL 
    const [courses, setCourses] = useState([]);
    const [topics, setTopics] = useState([]);
    const [isLoadingCourses, setIsLoadingCourses] = useState(false);
    const [isLoadingTopics, setIsLoadingTopics] = useState(false);
    const [resourceTypes, setResourceTypes] = useState({});
    const [fileTitles, setFileTitles] = useState([]);
    const [processingSuccess, setProcessingSuccess] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState([]);
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [showTopicSelect, setShowTopicSelect] = useState(false);
    const [showCheckSelect, setshowCheckSelect] = useState(false);
    const [processingDocument, setProcessingDocument] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [pendingModals, setPendingModals] = useState([]);

    // const openModal = (content) => {
    //     setModalContent(content);
    //     setModalOpen(true);
    // };
    // const handleModalOkClick = () => {
    //     closeModal();
    // };

    const openModal = (content) => {
        setPendingModals(prevModals => [...prevModals, content]);
    };

    // Mettez à jour la logique pour afficher les modals de la liste en attente séquentiellement
    useEffect(() => {
        if (pendingModals.length > 0 && !modalOpen) {
            setModalContent(pendingModals[0]);
            setModalOpen(true);
        }
    }, [pendingModals, modalOpen]);
    const closeModal = () => {
        setModalContent(null);
        setModalOpen(false);
        setPendingModals(prevModals => prevModals.slice(1));
    };


    const levelOptions = [
        { value: 'L3', label: 'L3' },
        { value: 'M1', label: 'M1' },
    ];

    const [selectedLevel, setSelectedLevel] = useState(levelOptions[0]);

    useEffect(() => {
        if (selectedLevel) {
            fetchCourses(selectedLevel.value);
        }
    }, [selectedLevel]);

    useEffect(() => {
        if (selectedCourse) {
            fetchTopics(selectedLevel.value, selectedCourse.value);
        }
    }, [selectedCourse, selectedLevel]);

    useEffect(() => {
        setResourceTypes({});
        setFileTitles([]);
    }, [selectedTopics]);

    const resetFields = () => {
        setResourceTypes({});
        setFileTitles([]);
        setProcessingSuccess(false);
    };
    useEffect(() => {
        if (processingSuccess) {
            resetFields();
        }
    }, [processingSuccess]);
    const handleLevelChange = (selectedOption) => {
        setSelectedLevel(selectedOption);
        setSelectedCourse(null);
        setSelectedTopics([]);
    };

    const handleCourseChange = (selectedOption) => {
        setSelectedCourse(selectedOption);
        setSelectedTopics([]);
        setShowTopicSelect(true);
    };

    const handleTopicChange = (selectedOption) => {
        setSelectedTopics(selectedOption);
        setResourceTypes({});
        setFileTitles([]);
        setshowCheckSelect(true);

    };

    // const handleResourceTypeChange = (topic, type) => {
    //     setResourceTypes(prevState => ({
    //         ...prevState,
    //         [topic.value]: {
    //             ...prevState[topic.value],
    //             [type]: !prevState[topic.value]?.[type]
    //         }
    //     }));
    // };

    const handleFileUpload = (topic, files) => {
        setResourceTypes(prevState => ({
            ...prevState,
            [topic]: {
                ...prevState[topic],
                uploadedFiles: [...(prevState[topic]?.uploadedFiles || []), ...files],
            }
        }));
        setFileTitles(prevTitles => [...prevTitles, ...Array(files.length).fill('')]);
    };

    const handleFileTitleChange = (index, title) => {
        const updatedTitles = [...fileTitles];
        updatedTitles[index] = title;
        setFileTitles(updatedTitles);
    };

    const shouldDisplayButton = (topic) => {
        const { uploadedFiles } = resourceTypes[topic] || {};
        if (!uploadedFiles) {
            return false;
        }
        return fileTitles.every(title => title.trim() !== '') && uploadedFiles.length > 0;
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
    const handleYoutubeUrlCountChange = (topic, count) => {
        setResourceTypes(prevState => ({
            ...prevState,
            [topic.value]: {
                ...prevState[topic.value],
                youtubeUrlCount: count
            }
        }));
    };
    const handleYoutubeUrlChange = (topic, index, url) => {
        setResourceTypes(prevState => {
            const prevTopicState = prevState[topic.value] || {};
            const prevYoutubeUrls = prevTopicState.youtubeUrls || [];
            const updatedYoutubeUrls = [...prevYoutubeUrls];
            updatedYoutubeUrls[index] = url;
            return {
                ...prevState,
                [topic.value]: {
                    ...prevTopicState,
                    youtubeUrls: updatedYoutubeUrls
                }
            };
        });
    };
    // const handleDocumentProcess = async (topic) => {
    //     setProcessingDocument(true);
    //     try {
    //         const formData = new FormData();
    //         formData.append('level', selectedLevel.value);
    //         formData.append('course_name', selectedCourse.value);
    //         formData.append('topic', topic.value);
    //         formData.append('title', 'Your Document Title');
    //         formData.append('file', resourceTypes[topic.value].uploadedFiles[0]);
    //         const response = await fetch(`${baseUrl}/home/pdf_pptx_upload`, {
    //             method: 'POST',
    //             body: formData
    //         });

    //         if (response.ok) {
    //             openModal({ icon: <MdCheckCircle size={48} color="green"  />, message: 'Document uploaded successfully!' });
    //             setProcessingSuccess(true);
    //             setProcessingDocument(false);
    //         } else {
    //             let errorMessage = 'An error occurred while uploading the document.';
    //             if (response.status === 409) {
    //                 errorMessage = 'This document already exists in the knowledge base.';
    //                 openModal({ icon: <MdWarning size={48} color="orange" />, message: errorMessage });
    //             } else {
    //                 const errorData = await response.json();
    //                 if (errorData.message) {
    //                     errorMessage += ' ' + errorData.message;
    //                 }
    //                 openModal({ icon: <MdError size={48} color="red" />, message: errorMessage });
    //             }
    //             setProcessingSuccess(true);
    //             setProcessingDocument(false);
    //         }
    //     } catch (error) {
    //         openModal({ icon: <MdError size={48} color="red" />, message: 'An error occurred while uploading the document.' });
    //         setProcessingSuccess(true);
    //     }
    // };

    const handleDocumentProcess = async (topic) => {
        setProcessingDocument(true);
        try {
            const { uploadedFiles } = resourceTypes[topic.value];
            for (const file of uploadedFiles) {
                const formData = new FormData();
                formData.append('level', selectedLevel.value);
                formData.append('course_name', selectedCourse.value);
                formData.append('topic', topic.value);
                formData.append('title', 'Your Document Title');
                formData.append('file', file);
                const response = await fetch(`${baseUrl}/home/pdf_pptx_upload`, {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    openModal({ icon: <MdCheckCircle size={48} color="green" />, message: `${file.name} uploaded successfully!` });
                } else {
                    let errorMessage = 'Error interne, Try later!';
                    if (response.status === 409) {
                        errorMessage = 'This document already exists in the knowledge base.';
                        openModal({ icon: <MdWarning size={48} color="yellow" />, message: `${errorMessage} (${file.name})` });
                        
                    } else {
                        const errorData = await response.json();
                        if (errorData.message) {
                            errorMessage += ' ' + errorData.message;
                        }
                        openModal({ icon: <MdError size={48} color="red" />, message: `${errorMessage}` });
                    }
                }
            }
            setProcessingSuccess(true);
        } catch (error) {
            console.error('Error processing document:', error);
            openModal({ icon: <MdError size={48} color="red" />, message: 'An error occurred while processing the document.' });
        } finally {
            setProcessingDocument(false);
        }
    };

    const handleYoutubeProcess = async (topic) => {
        setProcessingDocument(true);
        try {
            const { youtubeUrls, youtubeTitles } = resourceTypes[topic.value];
            
            // Vérifiez s'il y a des URL YouTube disponibles
            if (youtubeUrls && youtubeUrls.length > 0) {
                for (let i = 0; i < youtubeUrls.length; i++) {
                    const formData = new FormData();
                    formData.append('level', selectedLevel.value);
                    formData.append('course_name', selectedCourse.value);
                    formData.append('topic', topic.value);
                    formData.append('title', youtubeTitles[i] || 'Your YouTube Title');
                    formData.append('link', youtubeUrls[i]);
    
                    const response = await fetch(`${baseUrl}/home/youtube_link`, {
                        method: 'POST',
                        body: formData
                    });
                    console.log(response)
                    if (response.ok) {
                        openModal({ icon: <MdCheckCircle size={48} color="green" />, message: `${youtubeTitles[i]} processed successfully!` });
                    } else {
                        let errorMessage = 'Error interne, Try later!';
                        if (response.status === 409) {
                            errorMessage = 'This video already exists in the knowledge base.';
                            openModal({ icon: <MdWarning size={48} color="yellow" />, message: `${errorMessage} ${youtubeTitles[i]}` });

                        } else {
                            const errorData = await response.json();
                            if (errorData.message) {
                                errorMessage += ' ' + errorData.message;
                            }
                            openModal({ icon: <MdError size={48} color="red" />, message: `${errorMessage}` });

                        }
                    }
                }
            } else {
                openModal({ icon: <MdError size={48} color="red" />, message: 'No YouTube URLs available for processing.' });
            }
            
            setProcessingSuccess(true);
        } catch (error) {
            console.error('Error processing YouTube links:', error);
            openModal({ icon: <MdError size={48} color="red" />, message: 'An error occurred while processing the YouTube links' });
        } finally {
            setProcessingDocument(false);
        }
    };
    

    const handleYoutubeUrlTitleChange = (topic, index, title) => {
        setResourceTypes(prevState => {
            const prevTopicState = prevState[topic.value] || {};
            const prevYoutubeTitles = prevTopicState.youtubeTitles || [];
            const updatedYoutubeTitles = [...prevYoutubeTitles];
            updatedYoutubeTitles[index] = title;

            return {
                ...prevState,
                [topic.value]: {
                    ...prevTopicState,
                    youtubeTitles: updatedYoutubeTitles
                }
            };
        });
    };

    const shouldDisplayYoutubeButton = (topic) => {
        const youtubeUrls = resourceTypes[topic]?.youtubeUrls || [];
        const youtubeTitles = resourceTypes[topic]?.youtubeTitles || [];
        const youtubeUrlCount = resourceTypes[topic]?.youtubeUrlCount || 1;

        return youtubeUrls.length === youtubeUrlCount &&
            youtubeTitles.length === youtubeUrlCount &&
            youtubeUrls.every((url, index) => url.trim() !== '' && youtubeTitles[index].trim() !== '');
    };

    const handleResourceTypeRadioChange = (type) => {
        if (type === 'document') {
            setResourceTypes(prevState => ({
                ...prevState,
                [selectedTopics.value]: {
                    ...prevState[selectedTopics.value],
                    document: true,
                    youtube: false // Désélectionne la vidéo YouTube
                }
            }));
        } else if (type === 'youtube') {
            setResourceTypes(prevState => ({
                ...prevState,
                [selectedTopics.value]: {
                    ...prevState[selectedTopics.value],
                    document: false, // Désélectionne le document
                    youtube: true
                }
            }));
        }
    };
    const handleDocumentTypeChange = () => {
        handleResourceTypeRadioChange('document');
    };

    const handleYoutubeTypeChange = () => {
        handleResourceTypeRadioChange('youtube');
    };
    const fetchTopics = async (selectedLevelValue, selectedCourseValue) => {
        setIsLoadingTopics(true);
        try {
            const response = await fetch(`${baseUrl}/home/get_modules?level=${selectedLevelValue}&course_name=${selectedCourseValue}`);
            const data = await response.json();
            setTopics(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching topics:', error);
        }
        setIsLoadingTopics(false);
    };

    return (
        <div>
            <div className="containeer">
                <div className="dropdown-containeer">
                    <div className="select-wrappeer">
                        <Select
                            value={selectedLevel}
                            onChange={handleLevelChange}
                            options={levelOptions}
                            placeholder="Select level"
                            className="basic-single-select"
                        />
                    </div>
                    <div className="select-wrappeer">
                        <Select
                            value={selectedCourse}
                            onChange={handleCourseChange}
                            options={courses.map(course => ({ value: course, label: course }))}
                            placeholder={isLoadingCourses ? "Loading..." : "Select course"}
                            className="basic-single-select"
                            isDisabled={isLoadingCourses || !selectedLevel}
                        />
                    </div>
                    {showTopicSelect && selectedCourse && (
                        <div className="select-wrappeer_topics">
                            <Select
                                value={selectedTopics}
                                onChange={handleTopicChange}
                                options={topics.map(course => ({ value: course, label: course }))}
                                placeholder={isLoadingTopics ? "Loading..." : "Select topics"}
                                // isMulti={true}
                                className="basic-multi-select__control"
                                isDisabled={isLoadingTopics || !selectedCourse}
                            />

                            {showCheckSelect && selectedTopics && (
                                <div className="resource-types" key={selectedTopics.value}>
                                    <h4>{selectedTopics.label}</h4>
                                    <div className="checkbox-container">
                                        <div className="document-column">
                                            <div className="checkbox-containeer">
                                                <label htmlFor={`document-${selectedTopics.value}`}>
                                                    <input
                                                        type="radio"
                                                        name='radioo'
                                                        id={`document-${selectedTopics.value}_doc`}
                                                        checked={resourceTypes[selectedTopics.value]?.document || false}
                                                        onChange={handleDocumentTypeChange}
                                                    />
                                                    Document
                                                </label>
                                            </div>
                                            {resourceTypes[selectedTopics.value]?.document && (
                                                <div className='divvv'>
                                                    <Button
                                                        className='upl'
                                                        component="label"
                                                        role={undefined}
                                                        variant="contained"
                                                        startIcon={<CloudUploadIcon />}
                                                    >
                                                        Upload file
                                                        <input
                                                            type="file"
                                                            style={{ display: 'none' }}
                                                            accept=".pdf,.pptx"
                                                            multiple
                                                            onChange={e => handleFileUpload(selectedTopics.value, e.target.files)}
                                                            required
                                                        />
                                                    </Button>
                                                    {resourceTypes[selectedTopics.value]?.uploadedFiles && resourceTypes[selectedTopics.value]?.uploadedFiles.map((file, fileIndex) => (
                                                        <div key={fileIndex}>
                                                            <input
                                                                type="text"
                                                                placeholder={`Enter title for '${file.name}'`}
                                                                value={fileTitles[fileIndex]}
                                                                onChange={e => handleFileTitleChange(fileIndex, e.target.value)}
                                                                required
                                                            />
                                                        </div>
                                                    ))}
                                                    {shouldDisplayButton(selectedTopics?.value) && !processingDocument && (
                                                        <center><button onClick={() => handleDocumentProcess(selectedTopics)}>Start Document Process</button></center>
                                                    )}
                                                    {processingDocument && (
                                                        <div style={{ textAlign: 'center' }}>
                                                            <CircularProgress />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="url-column">
                                            <div className='checkbox-containeer'>
                                                <label htmlFor={`youtube-${selectedTopics.value}`}>
                                                    <input
                                                        type="radio"
                                                        name='radioo'
                                                        id={`youtube-${selectedTopics.value}`}
                                                        checked={resourceTypes[selectedTopics.value]?.youtube || false}
                                                        onChange={handleYoutubeTypeChange}
                                                    />
                                                    YouTube URL
                                                </label>
                                            </div>
                                            {resourceTypes[selectedTopics.value]?.youtube && (
                                                <div>
                                                    <input
                                                        type="number"
                                                        value={resourceTypes[selectedTopics.value]?.youtubeUrlCount || 1}
                                                        onChange={e => handleYoutubeUrlCountChange(selectedTopics, parseInt(e.target.value))}
                                                    />
                                                    {[...Array(resourceTypes[selectedTopics.value]?.youtubeUrlCount || 1)].map((_, inputIndex) => (
                                                        <div key={inputIndex}>
                                                            <input
                                                                type="text"
                                                                placeholder={`Enter URL ${inputIndex + 1}`}
                                                                onChange={e => handleYoutubeUrlChange(selectedTopics, inputIndex, e.target.value)}
                                                                required
                                                            />
                                                            <br />
                                                            <input
                                                                type="text"
                                                                placeholder={`Enter title for URL ${inputIndex + 1}`}
                                                                onChange={e => handleYoutubeUrlTitleChange(selectedTopics, inputIndex, e.target.value)}
                                                                required
                                                            />
                                                        </div>
                                                    ))}
                                                    {shouldDisplayYoutubeButton(selectedTopics.value) && !processingDocument && (
                                                        <center><button onClick={() => handleYoutubeProcess(selectedTopics)}>Start YouTube Process</button></center>
                                                    )}
                                                    {processingDocument && (
                                                        <div style={{ textAlign: 'center' }}>
                                                            <CircularProgress />
                                                        </div>
                                                    )}

                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                            )}
                            <Modal open={modalOpen} onClose={closeModal}>
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
                    )}
                </div>
            </div>

        </div>
    );
};

export default Process;
