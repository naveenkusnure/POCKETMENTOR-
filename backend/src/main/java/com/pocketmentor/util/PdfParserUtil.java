package com.pocketmentor.util;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;

@Component
public class PdfParserUtil {

    public record ExtractedPdf(String text, int pageCount) {}

    public ExtractedPdf extractText(InputStream inputStream) throws IOException {
        try (PDDocument document = PDDocument.load(inputStream)) {
            int pageCount = document.getNumberOfPages();
            PDFTextStripper stripper = new PDFTextStripper();
            String rawText = stripper.getText(document);
            String cleaned = (rawText == null) ? "" : rawText.trim();
            return new ExtractedPdf(cleaned, pageCount);
        }
    }

    public ExtractedPdf extractText(File file) throws IOException {
        try (PDDocument document = PDDocument.load(file)) {
            int pageCount = document.getNumberOfPages();
            PDFTextStripper stripper = new PDFTextStripper();
            String rawText = stripper.getText(document);
            String cleaned = (rawText == null) ? "" : rawText.trim();
            return new ExtractedPdf(cleaned, pageCount);
        }
    }
}
