import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import jsPDF from 'jspdf';
import ReactMarkdown from 'react-markdown';
import logoSkema from '../../../assets/images/logo_noir.png'
import { useStateGlobal } from '../../../context/contextStateGlobale';

/**
 * Custom scrollable dialog box component.
 * @param {object} props - The component props.
 * @param {string} props.textReference - The reference text to be displayed in the dialog box.
 * @param {string} props.textRoadMap - The roadmap text to be displayed in the dialog box.
 * @returns {React.ReactElement} The ScrollDialog component.
 */
export default function ScrollDialog({ textReference, textRoadMap }) {
  const [open, setOpen] = React.useState(false);
  const { level } = useStateGlobal();
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  //const cleanText = (text) => {
    // Remplace tous les ### ou ** par une chaine vide
  //  return text.replace(/###\s*|\*\*\s*|\*\*/g, '');
  //};
  
  /**
   * Formats the given text as Markdown.
   * @param {string} text - The text to be formatted.
   * @returns {string} The formatted Markdown text.
   */
  const formatTextToMarkdown = (text) => {
    const lines = text.split('\n');
    let markdown = '';

    lines.forEach(line => {
        // Vérifier si la ligne correspond à un titre de module ou de chapitre
        if (line.startsWith('Module')) {
            markdown += `##### ${line}\n`;
        }
        // Si ce n'est ni un titre de module ni une référence de livre, alors c'est une vidéo
        else {
            markdown += `- ${line}\n`;
        }
    });

    return markdown;
}

/**
   * Merges the reference and roadmap texts into a single string.
   * @returns {string} The merged text.
   */
const mergeText = () => {
    const formatTextReference = formatTextToMarkdown(textReference)
    let textforModal = '';
    if (level === 'L3') {
      textforModal += `### Exploration Essentielle : Références Clés pour ton Parcours de Mise à Niveau \n\n`;
    } else {
        textforModal += `### Essential Exploration: Key References for Your Upgrade Journey \n\n`;
    }

    textforModal+= formatTextReference

    if (level === 'L3') {
      textforModal += `### Revue Réflexive : Traçons Ensemble la Voie vers la Maîtrise avec notre Roadmap Personnalisée \n\n`;
  } else {
      textforModal += `### Reflective Review: Charting the Path to Mastery with Our Custom Roadmap \n\n`;
  }
    textforModal += textRoadMap

    return textforModal
}

/**
* Saves the displayed text as a PDF file.
*/
const txtsousTitle = level === 'L3' ? 'Plateforme de mise à niveau' : 'Upskilling Platform';
const txtTitle = level === 'L3' ? 'Exploration Essentielle : Références Clés pour ton Parcours de Mise à Niveau' : 'Essential Exploration: Key References for Your Upskilling';

const handleSave = () => {
    const pdf = new jsPDF();
    const title = txtTitle;
    const textToPrint = `${title}\n\n${textReference}`; 

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 10;
    const textWidth = pageWidth - 2 * margin;

    pdf.addImage(logoSkema, 'PNG', margin, 10, 50, 20);
    pdf.setLineWidth(0.1);
    pdf.line(margin, 32, pageWidth - margin, 32);
    pdf.setFontSize(13);
    pdf.text(txtsousTitle, margin, pdf.internal.pageSize.height - 10);
    pdf.text(`Page ${pdf.internal.getNumberOfPages()}`, pageWidth - margin, pdf.internal.pageSize.height - 10, { align: 'right' });

    const addContent = () => {
        pdf.addImage(logoSkema, 'PNG', margin, 10, 50, 20);
        pdf.setLineWidth(0.1);
        pdf.line(margin, 32, pageWidth - margin, 32);
        pdf.setFontSize(13);
        pdf.text(txtsousTitle, margin, pdf.internal.pageSize.height - 10);
        pdf.text(`${pdf.internal.getNumberOfPages()}`, pageWidth - margin, pdf.internal.pageSize.height - 10, { align: 'right' });
    };

    const lines = pdf.splitTextToSize(textToPrint, textWidth);
    let pageHeight = pdf.internal.pageSize.height;
    let y = 45;

    lines.forEach((line) => {
        let style = {};
        let indent = 0; // initial indentation

        if (line.includes('Module')) {
            style.font = 'helvetica';
            style.style = 'bold';
            style.size = 14;
        } else if (line.includes('Video') || line.includes('Vidéo')) {
            style.font = 'times';
            style.size = 12;
            style.style = 'normal';
            style.color = 'black';
            indent = 5; // indentation for videos
            line = '• ' + line; // add bullet to the line
        } else if (line.includes('Chapitre')) {
            style.font = 'courier';
            style.size = 11;
            style.style = 'italic';
            style.color = 'black';
            indent = 5; // indentation for chapters
            line = '• ' + line; // add bullet to the line
        }

        pdf.setFont(style.font, style.style);
        if (style.size) pdf.setFontSize(style.size);
        if (style.color) pdf.setTextColor(style.color);

        if (y + 10 > pageHeight - 25) {
            pdf.addPage();
            addContent();
            y = 45;
        }

        // Check if the text exceeds the maximum width and split the text if necessary
        const splittedText = pdf.splitTextToSize(line, textWidth - indent);

        // Display each line of text
        splittedText.forEach((textLine, index) => {
            if (y + (index * 10) > pageHeight - 25) {
                pdf.addPage();
                addContent();
                y = 45 + (index * 10);
            }
            pdf.text(margin + indent, y + (index * 10), textLine);
        });

        y += 10 * splittedText.length; // Increase the Y position for the next line
    });

    pdf.save("recommandation.pdf");
    setOpen(false);
};

  /**
   * Create a ref to store the reference to the descriptionElement DOM node.
   * @type {React.RefObject<HTMLDivElement>}
   */
  const descriptionElementRef = React.useRef(null);

  /**
   * Use useEffect to add behavior when the modal dialog is opened.
   * @param {boolean} open - The state variable that determines whether the modal is open or closed.
   */
  React.useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);
  const txtBtn = level === 'L3' ? 'Afficher Recommandation' : 'Display Recommendation';
  const txtDialog = level === 'L3' ? 'Recommandation' : 'Recommendation';
  const txtBtnClose = level === 'L3' ? 'Fermer' : 'Close';
  const txtBtnDownload = level === 'L3' ? 'Télécharger' : 'Download';

  const text = mergeText()
  return (
    <React.Fragment>
      <Button variant="outlined" onClick={handleClickOpen}>{txtBtn}</Button>
      <Dialog
        open={open}
        onClose={handleClose}
        scroll={'paper'}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">{txtDialog}</DialogTitle>
        <DialogContent dividers={true}>
          <DialogContentText
            id="scroll-dialog-description"
            ref={descriptionElementRef}
            tabIndex={-1}
          >
            <ReactMarkdown >{text}</ReactMarkdown>

          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{txtBtnClose}</Button>
          <Button onClick={handleSave}>{txtBtnDownload}</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}