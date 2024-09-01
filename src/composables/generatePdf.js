
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export  async function generatePdf(elementHtml) {

    const element = document.getElementById(elementHtml);

    html2canvas(element, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const margin = 20; // Ajusta este valor para cambiar el margen
        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = pdfWidth - 2 * margin;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        const scaleFactor = 0.75; // Ajusta este valor para escalar la imagen

        let heightLeft = imgHeight * scaleFactor;
        let position = margin;

        pdf.addImage(imgData, "PNG", margin, position, imgWidth * scaleFactor, imgHeight * scaleFactor);
        heightLeft -= pdfHeight - 2 * margin;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight * scaleFactor + margin;

            const xOffset = (pdfWidth - imgWidth * scaleFactor) / 2; // Centrar la imagen horizontalmente

            pdf.addPage();
            pdf.addImage(imgData, "PNG", margin, position, imgWidth * scaleFactor, imgHeight * scaleFactor);
            heightLeft -= pdfHeight - 2 * margin;
        }

        pdf.save("encuesta.pdf");
    });

}


export  function generatePdf2(elementHtml) {
    const element = document.getElementById(elementHtml);

    html2canvas(element, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const marginTop = 20; // Margen superior
        const marginBottom = 20; // Margen inferior
        const marginLeft = 10; // Margen izquierdo
        const marginRight = 10; // Margen derecho
        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = pdfWidth - marginLeft - marginRight;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        const scaleFactor = 0.75; // Ajusta este valor para escalar la imagen

        let heightLeft = imgHeight * scaleFactor;
        let position = marginTop;

        // Dividir el canvas en partes más pequeñas
        const pageCanvas = document.createElement("canvas");
        const pageCtx = pageCanvas.getContext("2d");
        pageCanvas.width = canvas.width;
        pageCanvas.height = canvas.width * (pdfHeight / pdfWidth);

        while (heightLeft > 0) {
            pageCtx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
            pageCtx.drawImage(canvas, 0, canvas.height - heightLeft, canvas.width, pageCanvas.height, 0, 0, pageCanvas.width, pageCanvas.height);

            const pageImgData = pageCanvas.toDataURL("image/png");
            const xOffset = (pdfWidth - imgWidth * scaleFactor) / 2; // Centrar la imagen horizontalmente

            pdf.addImage(pageImgData, "PNG", xOffset, marginTop, imgWidth * scaleFactor, pageCanvas.height * scaleFactor);

            heightLeft -= pageCanvas.height;
            if (heightLeft > 0) {
                pdf.addPage();
            }
        }

        pdf.save("encuesta.pdf");
    });
}