import { Request, Response } from "express";
import { getCustomRepository, IsNull, Not } from "typeorm";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";

class NpsController {
  async execute(request: Request, response: Response) {
    const { survey_id } = request.params;
    const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);
  
    const surveysUsers = await surveysUsersRepository.find({
      where: { survey_id, value: Not(IsNull())}
    });

    const detractors = surveysUsers.filter(
      (survey) => survey.value >= 0 && survey.value <= 6
    );
    const promoters = surveysUsers.filter(
      (survey) => survey.value >= 9 && survey.value <= 10
    );

    const totalAnswers = surveysUsers.length;

    const npsResult = (promoters.length - detractors.length) / totalAnswers * 100; 

    return response.status(200).json({
      detractors: detractors.length,
      promoters: promoters.length,
      totalAnswers,
      nps: `${npsResult.toFixed(1)}%`,
    });
  }
}

export { NpsController };