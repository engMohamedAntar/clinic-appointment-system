//PrismaApiFeatures.ts
export class PrismaApiFeatures {
  private filter: any;
  private orderBy: any;
  private select: any;
  private take: number;
  private skip: number;
  private keyword: string;
  private page: number;
  
  constructor(
    private query: Record<string,any>,
    private searchFields: string[],
  ) {
    //extract the query
    const { sort, fields, keyword, limit, page, ...filter } = query;
    this.filter = filter;
    this.keyword = keyword;
    this.take = limit ? parseInt(limit) : 10;
    this.skip = page ? (parseInt(page) - 1) * this.take : 0;
    this.page = page ? parseInt(page) : 1;

    this.setKeywordFilter();
    this.setSorting(sort);
    this.setFieldSelection(fields);
  }

  setKeywordFilter() {
    if (this.keyword && this.searchFields.length > 0) {
      this.filter.OR = this.searchFields.map((field) => ({
        [field]: { contains: this.keyword, mode: 'insensitive' },
      }));
    }
  }

  setSorting(sort: string | undefined) {
    if (sort) {
      let field = sort;
      let direction = 'asc';

      if (field.startsWith('-')) {
        field = sort.substring(1);
        direction = 'desc';
      }
      this.orderBy = { [field]: direction };
    }
  }

  setFieldSelection(fields: string | undefined) {
    if (fields) {
      const fieldsArray = fields.split(',');
      this.select = fieldsArray.reduce((acc, curr) => {
        acc[curr] = true;
        return acc;
      }, {});
    }
  }

  buildOptions() {
    return {
      where: this.filter,
      orderBy: this.orderBy,
      select: this.select,
      take: this.take,
      skip: this.skip,
    };
  }

  getPaginationInfo(total: number, resultsCount: number) {
    const totalPages = Math.ceil(total / this.take);
    return {
      results: resultsCount, //number of results returned after the pagination
      total, //all available docs
      currentPage: this.page,
      totalPages,
      prev: this.page > 1 ? this.page - 1 : undefined,
      next: this.page < totalPages ? this.page + 1 : undefined,
    };
  }
}
