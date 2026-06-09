import { createTeamService, getTeamsService, updateTeamService } from "../services/team.service.js"

export const createTeam = async(req,res)=>
{
    try {
        const team = await createTeamService(req.body,req.user._id);

        res.status(201).json({
            success:true,
            message:"Team created successfully",
            data:team,
        });



    } catch (error) {
        res.status(400).json({
            success:false,
            message:error.message,
        })
    }
};

export const getTeams = async(req,res)=>
{
    try {
        const teams = await getTeamsService();

        res.status(200).json({
            success:true,
            data:teams,
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        })
    }
};

export const updateTeam = async(req,res)=>
{
    try {
        const team = await updateTeamService(req.params.id,req.body);

        res.status(200).json({
            success:true,
            message:"Team updated successfully",
            data:team,
        });
    } catch (error) {
        res.status(400).json({
            success:false,
            message:error.message,
        })
    }
}
