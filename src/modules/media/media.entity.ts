import { AfterLoad, Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { MediaId } from "./field-types/media-id";
import { NoneEmptyString } from "../../data/non-empty-string";
import { MIME } from "./field-types/mime";
import { ActionEntity } from "../action/entity/action.entity";
import { Action } from "../action/model/action.model";

@Entity("media")
export class MediaEntity {
  @PrimaryColumn("uuid")
  id!: MediaId;

  @Column()
  name!: NoneEmptyString;

  @Column()
  mime!: MIME;

  @Column()
  size!: number;

  @Column()
  path!: string;

  url!: string;
  @AfterLoad()
  setUrl() {
    this.url = `${process.env.API_URL}/${this.path}`;
  }

  @OneToMany(() => ActionEntity, (action) => action.actor)
  actions!: Action[];
}
