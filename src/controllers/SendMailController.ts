import { resolve } from 'path';
import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import SendMailService from "../services/SendMailService";
import { UsersRepository } from "../repositories/UsersRepository";
import { SurveysRepository } from "../repositories/SurveysRepository";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";
import { AppError } from '../errors/AppError';

class SendMailController {
  async execute(request: Request, response : Response) {
    const { email, survey_id } = request.body;
    const npsPath = resolve(__dirname, "..", "views", "emails", "npsMail.hbs");

    const usersRepository = getCustomRepository(UsersRepository);
    const surveysRepository = getCustomRepository(SurveysRepository);
    const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

    const user = await usersRepository.findOne({ email });
    const survey = await surveysRepository.findOne({ id: survey_id });
    const registerAlreadyExists = await surveysUsersRepository.findOne({ 
      where: { 
        user_id: user.id, 
        survey_id: survey.id, 
        value: null 
      },
      relations: ["user", "survey"],
    });

    const variables = {
      name: user.name,
      title: survey.title,
      description: survey.description,
      id: "",
      link: process.env.URL_MAIL
    };

    if (!user) {
      throw new AppError("User doesn't exists!");
    } 
    
    if (!survey) {
      throw new AppError("Survey doesn't exists!");
    }

    if(registerAlreadyExists) {
      variables.id = registerAlreadyExists.id;
      
      await SendMailService.execute(email, survey.title, variables, npsPath);
      
      throw new AppError("Register already exists! Email sent again.");
    }

    const surveyUser = surveysUsersRepository.create({
      user_id: user.id,
      survey_id
    });
    await surveysUsersRepository.save(surveyUser);
    variables.id = surveyUser.id;

    await SendMailService.execute(email, survey.title, variables, npsPath);

    return response.status(201).json(surveyUser);
  }
}

export { SendMailController };
