<script setup>
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const question = [
    {
        "Id": 15,
        "IdEncuesta": 1,
        "IdQuestion": "586a686d-1ade-0202-021b-12ee6c3a50da",
        "TextoPregunta": "Gracias por comprar en Tiendas DAKA!!! Ayúdenos a mejorar el servicio contestando esta pequeña encuesta de atención",
    },
    {
        "Id": 14,
        "IdEncuesta": 1,
        "IdQuestion": "696f050e-6055-0a86-35c1-7b12e3036165",
        "TextoPregunta": "Introduzca su fecha de nacimiento",
    },
    {
        "Id": 11,
        "IdEncuesta": 1,
        "IdQuestion": "f721d432-2a3b-0984-35ec-598ccb4793ed",
        "TextoPregunta": "Introduzca su correo electronico",
    },
    {
        "Id": 2,
        "IdEncuesta": 1,
        "IdQuestion": "4d142491-94ed-04a7-2b1d-54c3f1084a1c",
        "TextoPregunta": "1.¿En qué tienda realizo su compra?",
    }
];

function generatePdf(elementHtml) {
    const element = document.getElementById(elementHtml);

    html2canvas(element, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("encuesta.pdf");
    });
}
</script>

<template>
    <button @click="generatePdf('pdf')">Generar</button>

    <div id="pdf"> 
        <div v-for="item, idx in question" :key="idx" class="card mt-3">
            <div id="PagePdf">
                <div class="col-auto">
                    <span :class="getSpanClass(isCorrectQuestion(idx), item)" class="textoQuestion">
                        {{ item.TextoPregunta }}
                        <span v-if="item.Required" class="asterisk">*</span>
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>
