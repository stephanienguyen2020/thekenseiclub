import { FileReader, Document } from '@llamaindex/core/schema';
import { ParserLanguages, ParsingMode } from '../../api/dist/index.cjs';

type Language = ParserLanguages;
type ResultType = "text" | "markdown" | "json";
type WriteStream = {
    write: (text: string) => void;
};
/**
 * Represents a reader for parsing files using the LlamaParse API.
 * See https://github.com/run-llama/llama_parse
 */
declare class LlamaParseReader extends FileReader {
    #private;
    project_id?: string | undefined;
    organization_id?: string | undefined;
    apiKey: string;
    baseUrl: string;
    resultType: ResultType;
    checkInterval: number;
    maxTimeout: number;
    verbose: boolean;
    language: ParserLanguages[];
    parsingInstruction?: string | undefined;
    skipDiagonalText?: boolean | undefined;
    invalidateCache?: boolean | undefined;
    doNotCache?: boolean | undefined;
    fastMode?: boolean | undefined;
    doNotUnrollColumns?: boolean | undefined;
    pageSeparator?: string | undefined;
    pagePrefix?: string | undefined;
    pageSuffix?: string | undefined;
    gpt4oMode: boolean;
    gpt4oApiKey?: string | undefined;
    boundingBox?: string | undefined;
    targetPages?: string | undefined;
    ignoreErrors: boolean;
    splitByPage: boolean;
    useVendorMultimodalModel: boolean;
    vendorMultimodalModelName?: string | undefined;
    vendorMultimodalApiKey?: string | undefined;
    webhookUrl?: string | undefined;
    premiumMode?: boolean | undefined;
    takeScreenshot?: boolean | undefined;
    disableOcr?: boolean | undefined;
    disableReconstruction?: boolean | undefined;
    inputS3Path?: string | undefined;
    outputS3PathPrefix?: string | undefined;
    continuousMode?: boolean | undefined;
    isFormattingInstruction?: boolean | undefined;
    annotateLinks?: boolean | undefined;
    azureOpenaiDeploymentName?: string | undefined;
    azureOpenaiEndpoint?: string | undefined;
    azureOpenaiApiVersion?: string | undefined;
    azureOpenaiKey?: string | undefined;
    auto_mode?: boolean | undefined;
    auto_mode_trigger_on_image_in_page?: boolean | undefined;
    auto_mode_trigger_on_table_in_page?: boolean | undefined;
    auto_mode_trigger_on_text_in_page?: string | undefined;
    auto_mode_trigger_on_regexp_in_page?: string | undefined;
    bbox_bottom?: number | undefined;
    bbox_left?: number | undefined;
    bbox_right?: number | undefined;
    bbox_top?: number | undefined;
    disable_image_extraction?: boolean | undefined;
    extract_charts?: boolean | undefined;
    guess_xlsx_sheet_name?: boolean | undefined;
    html_make_all_elements_visible?: boolean | undefined;
    html_remove_fixed_elements?: boolean | undefined;
    html_remove_navigation_elements?: boolean | undefined;
    http_proxy?: string | undefined;
    input_url?: string | undefined;
    max_pages?: number | undefined;
    output_pdf_of_document?: boolean | undefined;
    structured_output?: boolean | undefined;
    structured_output_json_schema?: string | undefined;
    structured_output_json_schema_name?: string | undefined;
    extract_layout?: boolean | undefined;
    stdout?: WriteStream | undefined;
    output_tables_as_HTML: boolean;
    input_s3_region?: string | undefined;
    output_s3_region?: string | undefined;
    preserve_layout_alignment_across_pages?: boolean | undefined;
    spreadsheet_extract_sub_tables?: boolean | undefined;
    formatting_instruction?: string | undefined;
    parse_mode?: ParsingMode | undefined;
    system_prompt?: string | undefined;
    system_prompt_append?: string | undefined;
    user_prompt?: string | undefined;
    job_timeout_in_seconds?: number | undefined;
    job_timeout_extra_time_per_page_in_seconds?: number | undefined;
    strict_mode_image_extraction?: boolean | undefined;
    strict_mode_image_ocr?: boolean | undefined;
    strict_mode_reconstruction?: boolean | undefined;
    strict_mode_buggy_font?: boolean | undefined;
    ignore_document_elements_for_layout_detection?: boolean | undefined;
    complemental_formatting_instruction?: string | undefined;
    content_guideline_instruction?: string | undefined;
    constructor(params?: Partial<Omit<LlamaParseReader, "language" | "apiKey">> & {
        language?: ParserLanguages | ParserLanguages[] | undefined;
        apiKey?: string | undefined;
    });
    private getJobResult;
    /**
     * Loads data from a file and returns an array of Document objects.
     * To be used with resultType = "text" and "markdown"
     *
     * @param {Uint8Array} fileContent - The content of the file to be loaded.
     * @param {string} filename - The name of the file to be loaded.
     * @return {Promise<Document[]>} A Promise object that resolves to an array of Document objects.
     */
    loadDataAsContent(fileContent: Uint8Array, filename?: string): Promise<Document[]>;
    /**
     * Loads data from a file and returns an array of JSON objects.
     * To be used with resultType = "json"
     *
     * @param {string} filePathOrContent - The file path to the file or the content of the file as a Buffer
     * @return {Promise<Record<string, any>[]>} A Promise that resolves to an array of JSON objects.
     */
    loadJson(filePathOrContent: string | Uint8Array): Promise<Record<string, any>[]>;
    /**
     * Downloads and saves images from a given JSON result to a specified download path.
     * Currently only supports resultType = "json"
     *
     * @param {Record<string, any>[]} jsonResult - The JSON result containing image information.
     * @param {string} downloadPath - The path to save the downloaded images.
     * @return {Promise<Record<string, any>[]>} A Promise that resolves to an array of image objects.
     */
    getImages(jsonResult: Record<string, any>[], downloadPath: string): Promise<Record<string, any>[]>;
    private getImagePath;
    private fetchAndSaveImage;
    private filterSpecificParams;
    private splitTextBySeparator;
}

export { type Language, LlamaParseReader, type ResultType };
