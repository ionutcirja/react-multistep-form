// @flow
import React, { Component } from 'react';
import type { ComponentType } from 'react';

type Values = {
  [key: string]: any
} | null;

type Props = {
  values?: Values | null,
  pages: Array<ComponentType<any>>,
  handleSubmit?: Function | null,
}

type State = {
  currentPageIndex: number,
  submitting: boolean,
  error: string,
};

class MultiStepForm extends Component<Props, State> {
  static defaultProps = {
    handleSubmit: null,
    values: null,
  };

  state = {
    currentPageIndex: 0,
    submitting: false,
    error: '',
  };

  values: Values = {};

  constructor(props: Props) {
    super(props);
    const { values } = props;
    if (values) {
      this.values = values;
    }
  }

  setValues = (values: Values) => {
    this.values = {
      ...this.values,
      ...values,
    };
  };

  next = () => {
    const { pages } = this.props;
    this.setState(prevState => ({
      currentPageIndex: Math.min(prevState.currentPageIndex + 1, pages.length - 1),
    }));
  };

  previous = () => {
    this.setState(prevState => ({
      currentPageIndex: Math.max(prevState.currentPageIndex - 1, 0),
    }));
  };

  edit = () => {
    this.setState(() => ({
      currentPageIndex: 0,
    }));
  };

  setSubmitting = (submitting: boolean, error: string = '') => {
    this.setState(() => ({
      submitting,
      error,
    }));
  };

  submit = (values: Values) => {
    const { pages, handleSubmit } = this.props;
    const { currentPageIndex } = this.state;
    const isLastPage = currentPageIndex === pages.length - 1;

    this.setValues(values);

    if (isLastPage && handleSubmit) {
      this.setSubmitting(true);

      new Promise((resolve, reject) => {
        handleSubmit({
          values: this.values,
          submitSuccess: resolve,
          submitError: reject,
        });
      }).then(() => {
        this.setSubmitting(false);
      }).catch((error) => {
        this.setSubmitting(false, error);
      });
    }

    if (!isLastPage) {
      this.next();
    }
  };

  render() {
    const { pages } = this.props;
    const { currentPageIndex, submitting, error } = this.state;
    const ActivePage = pages[currentPageIndex];

    return (
      <ActivePage
        submit={this.submit}
        next={this.next}
        previous={this.previous}
        edit={this.edit}
        submitting={submitting}
        error={error}
        multiStepFormValues={this.values}
      />
    );
  }
}

export default MultiStepForm;
