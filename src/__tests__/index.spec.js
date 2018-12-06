import React from 'react';
import { shallow } from 'enzyme';
import MultiStepForm from '..';

describe('React MultiStep Form', () => {
  const Page1 = () => <span>page 1</span>;
  const Page2 = () => <span>page 2</span>;
  const Page3 = () => <span>page 3</span>;
  let propsToRender;

  beforeEach(() => {
    propsToRender = {
      pages: [Page1, Page2, Page3],
      handleSubmit: jest.fn(),
    };
  });

  describe('render', () => {
    it('should render the first page on initial render', () => {
      const wrapper = shallow(<MultiStepForm {...propsToRender} />);
      expect(wrapper.find(Page1).length).toEqual(1);
    });

    it('should be able to pass some initial values as a prop', () => {
      const values = { someProp: 'some value' };
      let wrapper = shallow(<MultiStepForm {...propsToRender} />);
      expect(wrapper.instance().values).toEqual({});

      wrapper = shallow(<MultiStepForm {...propsToRender} values={values} />);
      expect(wrapper.instance().values).toEqual(values);
    });

    it('should render the next page when next method is called', () => {
      const wrapper = shallow(<MultiStepForm {...propsToRender} />);
      wrapper.instance().next();
      expect(wrapper.find(Page2).length).toEqual(1);
      wrapper.instance().next();
      expect(wrapper.find(Page3).length).toEqual(1);
      wrapper.instance().next();
      expect(wrapper.find(Page3).length).toEqual(1);
    });

    it('should render the previous page when previous method is called', () => {
      const wrapper = shallow(<MultiStepForm {...propsToRender} />);
      wrapper.instance().next();
      wrapper.instance().next();
      wrapper.instance().next();
      wrapper.instance().previous();
      expect(wrapper.find(Page2).length).toEqual(1);
      wrapper.instance().previous();
      expect(wrapper.find(Page1).length).toEqual(1);
      wrapper.instance().previous();
      expect(wrapper.find(Page1).length).toEqual(1);
    });

    it('should render the first page when edit method is called', () => {
      const wrapper = shallow(<MultiStepForm {...propsToRender} />);
      wrapper.instance().next();
      wrapper.instance().next();
      wrapper.instance().edit();
      const page = wrapper.find(Page1);
      expect(page.length).toEqual(1);
    });
  });

  describe('submit', () => {
    it('should render the next page and pass the current values when submit is called'
      + ' if the last page is not the current page', () => {
      const wrapper = shallow(<MultiStepForm {...propsToRender} />);
      wrapper.instance().submit({ someProp: 'value' });
      let page = wrapper.find(Page2);
      expect(page.length).toEqual(1);
      expect(page.props().submitting).toEqual(false);
      expect(page.props().multiStepFormValues).toEqual({ someProp: 'value' });
      wrapper.instance().submit({ otherProp: 'other value' });
      page = wrapper.find(Page3);
      expect(page.length).toEqual(1);
      expect(page.props().multiStepFormValues).toEqual({
        someProp: 'value',
        otherProp: 'other value',
      });
    });

    it('should set submitting prop value to true and'
      + ' call the handleSubmit prop if the last page is the current page', () => {
      const wrapper = shallow(<MultiStepForm {...propsToRender} />);
      wrapper.instance().next();
      wrapper.instance().next();
      wrapper.instance().next();
      wrapper.instance().submit({ prop: 'value' });
      const page = wrapper.find(Page3);
      expect(page.props().submitting).toEqual(true);
      expect(propsToRender.handleSubmit.mock.calls[0][0].values).toEqual({ prop: 'value' });
    });

    it('should set submitting prop value to false and error state value to an empty string'
      + ' when submit promise will be resolved', (done) => {
      propsToRender.handleSubmit.mockImplementation(options => options.resolve());
      const wrapper = shallow(<MultiStepForm {...propsToRender} />);
      wrapper.instance().next();
      wrapper.instance().next();
      wrapper.instance().next();
      wrapper.instance().submit({ prop: 'value' });
      process.nextTick(() => {
        const page = wrapper.find(Page3);
        expect(page.props().submitting).toEqual(false);
        done();
      });
    });

    it('should set submitting prop value to false when submit promise will be rejected', (done) => {
      propsToRender.handleSubmit.mockImplementation(options => options.reject({}));
      const wrapper = shallow(<MultiStepForm {...propsToRender} />);
      wrapper.instance().next();
      wrapper.instance().next();
      wrapper.instance().next();
      wrapper.instance().submit({ prop: 'value' });
      process.nextTick(() => {
        const page = wrapper.find(Page3);
        expect(page.props().submitting).toEqual(false);
        done();
      });
    });

    it('should set submitting prop value to false and set an error prop'
      + ' when submit promise will be rejected with an error', (done) => {
      propsToRender.handleSubmit.mockImplementation(options => options.reject('some error'));
      const wrapper = shallow(<MultiStepForm {...propsToRender} />);
      wrapper.instance().next();
      wrapper.instance().next();
      wrapper.instance().next();
      wrapper.instance().submit({ prop: 'value' });
      process.nextTick(() => {
        const page = wrapper.find(Page3);
        const props = page.props();
        expect(props.submitting).toEqual(false);
        expect(props.error).toEqual('some error');
        done();
      });
    });
  });
});
