import {
    getSubmissionsService,
    reviewSubmissionService,
    submitWorkService,
} from "../services/submission.service.js"

export const submitWork = async(req,res)=>
{
    try {
        const files = req.file
            ? [
                {
                    url: req.file.path,
                    publicId: req.file.filename,
                    originalName: req.file.originalname,
                    mimetype: req.file.mimetype,
                    size: req.file.size,
                },
            ]
            : req.body.files;

        const submission = await submitWorkService(
            {
                ...req.body,
                files,
                message: req.body.message ?? req.body.comment,
            },
            req.user._id
        );

        res.status(201).json(
            {
                success:true,
                message:"Work submitted successfully",
                data:submission
            }
        )
    } catch (error) {
        res.status(400).json({
            success:false,
            message:error.message
        })
    }
};

export const reviewSubmission = async(req,res)=>
{
    try {
        const reviewStatus = req.body.reviewStatus ?? req.body.status;

        const submission = await reviewSubmissionService(req.params.id,
            reviewStatus,
            req.user._id
        );

        res.status(200).json(
            {
                success:true,
                message:"Submission reviewd successfully",
                data:submission,
            }
        );

    } catch (error) {
        res.status(400).json(
            {
                success:false,
                message:error.message,
            }
        )
    }
}

export const getSubmissions = async(req,res)=>
{
    try {
        const submissions = await getSubmissionsService(req.user);

        res.status(200).json({
            success:true,
            data:submissions,
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}
