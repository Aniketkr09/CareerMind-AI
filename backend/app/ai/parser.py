from pathlib import Path
import logging

import fitz  # PyMuPDF


logger = logging.getLogger(__name__)


class ResumeParser:
    """
    CareerMind AI Resume Parser

    Extracts structured text from PDF resumes
    using PyMuPDF.
    """


    @staticmethod
    def extract_text_from_pdf(
        file_path: str
    ) -> str:
        """
        Extract text content from PDF resume.

        Args:
            file_path:
                Path of uploaded PDF file.

        Returns:
            Extracted and cleaned resume text.

        Raises:
            FileNotFoundError:
                When file does not exist.

            ValueError:
                When PDF has no readable text.

            RuntimeError:
                When PDF processing fails.
        """


        path = Path(file_path)



        # -------------------------------
        # Validate file existence
        # -------------------------------

        if not path.exists():

            raise FileNotFoundError(
                f"Resume file not found: {file_path}"
            )



        # -------------------------------
        # Validate extension
        # -------------------------------

        if path.suffix.lower() != ".pdf":

            raise ValueError(
                "Only PDF files are supported."
            )



        try:

            extracted_text = []



            # -------------------------------
            # Open PDF
            # -------------------------------

            with fitz.open(
                str(path)
            ) as pdf:


                for page_number, page in enumerate(pdf):

                    text = page.get_text(
                        "text"
                    )


                    if text:

                        extracted_text.append(
                            text
                        )


            final_text = "\n".join(
                extracted_text
            ).strip()



            # -------------------------------
            # Empty PDF check
            # -------------------------------

            if not final_text:

                raise ValueError(
                    "No readable text found. "
                    "The PDF may be scanned."
                )



            # -------------------------------
            # Clean text
            # -------------------------------

            final_text = (
                " "
                .join(final_text.split())
            )



            logger.info(
                "Resume parsed successfully | Characters=%s",
                len(final_text)
            )


            return final_text



        except (FileNotFoundError, ValueError):

            raise



        except Exception as exc:

            logger.exception(
                "PDF parsing failed: %s",
                exc
            )


            raise RuntimeError(
                "Unable to extract resume text."
            ) from exc




# ==========================================================
# Service Helper Function
# ==========================================================

def extract_text_from_pdf(
    file_path: str
) -> str:
    """
    Helper function used by ResumeService.
    """

    return ResumeParser.extract_text_from_pdf(
        file_path
    )