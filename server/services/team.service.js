import Team from "../models/Team.js";
import User from "../models/User.js";
import { createActivity } from "./activity.service.js";

export const createTeamService = async(data , createdBy)=>
{
    const {
        teamName,
        departmentType,
        leader,
        workers,
    } = data;

    const existingTeam = await Team.findOne({teamName});

    if(existingTeam)
    {
        throw new Error("Team already exists");
    }

    const team = await Team.create({
        teamName,
        departmentType,
        leader,
        workers,
        createdBy
    });

    //Update leader's teamId
    if(leader){
        await User.findByIdAndUpdate(leader,{
            teamId:team._id,
        })
    }

    if(workers?.length > 0){
       await User.updateMany(
        {_id: {$in:workers}},
        {teamId:team._id}
       )
    }

    await createActivity({
        userId: createdBy,
        action: "TEAM_CREATED",
        description: `Created team: ${team.teamName}`,
    });

    return team;

}

export const getTeamsService = async() =>
{
    const teams = await Team.find()
    .populate("leader","fullName email role")
    .populate("workers","fullName email role")
    .populate("createdBy", "fullName email")

    return teams;
};

export const updateTeamService = async(teamId,data)=>
{
    const team = await Team.findById(teamId);

    if(!team)
    {
        throw new Error("Team not found");
    }

    Object.assign(team,data);

    await team.save();

    return team;
}

