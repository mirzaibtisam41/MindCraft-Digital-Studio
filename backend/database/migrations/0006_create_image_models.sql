CREATE TABLE "image_models" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"provider" varchar(50) NOT NULL,
	"label" varchar(100) NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"capabilities" jsonb NOT NULL,
	"credits_per_image" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

--> statement-breakpoint
INSERT INTO "image_models" ("id", "provider", "label", "enabled", "sort_order", "capabilities", "credits_per_image") VALUES
  ('gpt-image-1-mini', 'openai', 'GPT Image 1 Mini', true, 0, '{"sizes":["1024x1024","1024x1536","1536x1024"],"qualities":["low","medium","high"],"backgrounds":["auto","opaque"],"moderations":["auto","low"],"outputFormats":["png"],"defaults":{"size":"1024x1024","quality":"medium","n":1,"background":"auto","moderation":"auto","outputFormat":"png"},"maxPromptLength":32000,"maxImagesPerRequest":10,"maxReferenceImages":16,"features":{"textToImage":"supported","imageEditing":"supported","referenceImages":"supported","maskInpainting":"untested","transparentBackground":"untested","partialImageStreaming":"untested","seed":"unsupported","negativePrompt":"unsupported","strength":"unsupported","upscaling":"unsupported","progress":"unsupported"},"inputFidelities":["low"]}'::jsonb, '{"low":1,"medium":2,"high":4}'::jsonb),
  ('gpt-image-1', 'openai', 'GPT Image 1', true, 1, '{"sizes":["1024x1024","1024x1536","1536x1024"],"qualities":["low","medium","high"],"backgrounds":["auto","opaque"],"moderations":["auto","low"],"outputFormats":["png"],"defaults":{"size":"1024x1024","quality":"medium","n":1,"background":"auto","moderation":"auto","outputFormat":"png"},"maxPromptLength":32000,"maxImagesPerRequest":10,"maxReferenceImages":16,"features":{"textToImage":"supported","imageEditing":"supported","referenceImages":"supported","maskInpainting":"untested","transparentBackground":"untested","partialImageStreaming":"untested","seed":"unsupported","negativePrompt":"unsupported","strength":"unsupported","upscaling":"unsupported","progress":"unsupported"},"inputFidelities":["low","high"]}'::jsonb, '{"low":2,"medium":4,"high":8}'::jsonb);
